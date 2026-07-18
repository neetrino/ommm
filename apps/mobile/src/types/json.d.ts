declare module "*.json" {
  const value: Record<string, unknown>;
  export default value;
}

declare module "*.mp4" {
  const asset: number;
  export default asset;
}

declare const __DEV__: boolean;
