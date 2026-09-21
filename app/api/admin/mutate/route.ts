import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime="nodejs";

const configs:Record<string,{table:string;fields:string[]}>={
  products:{table:"products",fields:["title","slug","description","price","stock","type","category","image_url","featured","active","discount_percent","short_description","digital_asset_path"]},
  categories:{table:"product_categories",fields:["name","slug","active"]},
  courses:{table:"courses",fields:["title","slug","description","category","level","price","cover_url","featured","published"]},
  blog:{table:"blog_posts",fields:["title","slug","excerpt","content","featured_image_path","published","category_id"]},
  settings:{table:"site_settings",fields:["key","value"]},
  classes:{table:"live_sessions",fields:["course_id","title","description","starts_at","duration_minutes","capacity","default_max_entries","meet_url"]},
  assignments:{table:"assignments",fields:["course_id","title","description","deadline","attachment_url","is_grades_published"]}
};

async function guard(){
  const userClient=await createClient();
  const {data:{user}}=await userClient.auth.getUser();
  if(!user) return null;
  const {data:profile}=await userClient.from("profiles").select("role").eq("id",user.id).maybeSingle();
  return profile?.role==="admin"?user:null;
}

export async function POST(request:NextRequest){
  try{
    const user=await guard(); if(!user) return NextResponse.json({ok:false,error:"دسترسی غیرمجاز."},{status:403});
    const body=await request.json(); const section=String(body?.section??""); const action=String(body?.action??""); const payload=body?.data??{};
    const cfg=configs[section]; if(!cfg && !["payments","orders"].includes(section)) return NextResponse.json({ok:false,error:"بخش نامعتبر است."},{status:400});
    if(section==="payments" || section==="orders") {
      if(action!=="update" || !payload.id || !payload.status) return NextResponse.json({ok:false,error:"عملیات نامعتبر است."},{status:400});
      const target=section==="payments"?"payments":"orders";
      const result=await createAdminClient().from(target).update({status:payload.status,admin_note:payload.admin_note??null,reviewed_at:section==="payments"?new Date().toISOString():undefined}).eq("id",payload.id).select().single();
      if(result.error) throw result.error;
      if(section==="payments"){ const orderStatus=payload.status==="approved"?"paid":payload.status==="rejected"?"rejected":undefined; if(orderStatus) await createAdminClient().from("orders").update({status:orderStatus}).eq("id",result.data.order_id); }
      await createAdminClient().from("audit_logs").insert({actor_id:user.id,action:`update_${section}`,entity_type:target,entity_id:payload.id,after_data:result.data});
      return NextResponse.json({ok:true,data:result.data});
    }
    const admin=createAdminClient();
    const row:any={}; for(const f of cfg.fields) if(payload[f]!==undefined) row[f]=payload[f];
    if(section==="blog" && row.published && !payload.published_at) row.published_at=new Date().toISOString();
    let result:any;
    if(action==="create") result=await admin.from(cfg.table).insert(row).select().single();
    else if(action==="update" && payload.id) result=await admin.from(cfg.table).update(row).eq("id",payload.id).select().single();
    else if(action==="delete" && payload.id) result=await admin.from(cfg.table).delete().eq("id",payload.id);
    else return NextResponse.json({ok:false,error:"عملیات نامعتبر است."},{status:400});
    if(result.error) throw result.error;
    await admin.from("audit_logs").insert({actor_id:user.id,action:`${action}_${section}`,entity_type:cfg.table,entity_id:payload.id??result.data?.id??result.data?.key,after_data:result.data??row});
    return NextResponse.json({ok:true,data:result.data??null});
  }catch(error){console.error("admin mutate",error);return NextResponse.json({ok:false,error:"عملیات انجام نشد."},{status:500});}
}

export async function PATCH(request:NextRequest){ return POST(request); }
export async function DELETE(request:NextRequest){ return POST(request); }
