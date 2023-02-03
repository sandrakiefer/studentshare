import { useToken } from "@/service/principal/PrincipalService";
import type { Token } from "@/service/principal/Principal";
import type { FetchOptions, HeaderPair } from "@/service/principal/Fetch";

/**
 * Acces to the current principal and possibility to set the token.
 */
const { principal, setToken } = useToken();

/**
 * Help function to create default headers for backend.
 * Declares the sending and accepting of json data.
 * Adds jwt token for endpoints where authentication is needed.
 *
 * @param withToken true if endpoint is secured and jwt token should be added, otherwise false
 * @param customHeaders array of additional headers (key-value pair)
 * @returns promise of header containing the requested data
 */
async function initHeaders(
  withToken: boolean,
  customHeaders: Array<HeaderPair> = []
): Promise<Headers> {
  const headers: HeadersInit = new Headers();
  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");
  customHeaders.forEach((h) => headers.set(h.key, h.value));
  if (withToken)
    headers.set("Authorization", "Bearer " + principal.value.token.token);
  return headers;
}

/**
 * Wrapper method to make fetch-calls with default configuration
 * for adding headers and processing received headers.
 *
 * @param url url where the fetch request should be sent to
 * @param method specified http request method (get, post, put, delete, ...)
 * @param body json request body as string
 * @param authentication true if the requested url requires token, otherwise false
 * @param customHeaders array of additional headers (key-value pair)
 * @returns promise of response containing the response of the fetch-call
 */
async function wrappedFetch(
  url: string,
  method: string,
  body = "",
  authentication = true,
  customHeaders: Array<HeaderPair> = []
): Promise<Response> {
  const fetchOptions: FetchOptions = {
    method: method,
    headers: await initHeaders(authentication, customHeaders),
  };
  if (body !== "") fetchOptions["body"] = body;
  const response = await fetch(url, fetchOptions);
  if (response.status == 200) {
    const tokenHeader = response.headers.get("X-Authorization");
    if (tokenHeader !== null) {
      const newToken: Token = {
        token: tokenHeader.substring("Bearer ".length),
      };
      setToken(newToken);
    }
  } else {
    console.log(response.status);
    console.log(response);
  }
  return response;
}

/* ---------- Export function to use in the services and components --------- */

export function useWrappedFetch() {
  return {
    wrappedFetch,
  };
}
