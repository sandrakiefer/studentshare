export interface Principal {
  token: Token;
  email: string;
  name: string;
  courses: string;
  expires: number;
  issuedAt: number;
}

export enum State {
  LOGGED_IN,
  LOGGED_OUT,
}

export interface Token {
  token: string;
}

export interface TokenPayload {
  email: string;
  name: string;
  courses: string;
  iat: number;
  exp: number;
}
