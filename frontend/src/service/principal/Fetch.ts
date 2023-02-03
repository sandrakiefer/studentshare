export interface HeaderPair {
  key: string;
  value: string;
}

export interface FetchOptions {
  method: string;
  headers: Headers;
  body?: string;
}
