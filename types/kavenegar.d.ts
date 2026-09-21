declare module "kavenegar" {
  export interface KavenegarApiOptions { apikey: string }
  export interface SendParams { message: string; sender: string; receptor: string }
  export type KavenegarCallback = (response: unknown, status: number, message?: string) => void;
  export interface KavenegarApiClient {
    Send(params: SendParams, callback: KavenegarCallback): void;
  }
  export function KavenegarApi(options: KavenegarApiOptions): KavenegarApiClient;
}