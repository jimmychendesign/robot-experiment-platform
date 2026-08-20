interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface D1Database {
  readonly __axisTypeBrand?: "D1Database";
}

declare module "cloudflare:workers" {
  export const env: {
    ASSETS: Fetcher;
    DB?: D1Database;
  };
}
