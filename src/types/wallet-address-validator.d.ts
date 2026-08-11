declare module "wallet-address-validator" {
  interface Validator {
    validate(address: string, currency?: string, networkType?: string): boolean;
  }
  const WAValidator: Validator;
  export = WAValidator;
}
