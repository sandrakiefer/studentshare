import { useToken } from "@/service/principal/PrincipalService";
import { useWrappedFetch } from "@/service/principal/FetchService";
import type { Principal } from "@/service/principal/Principal";

/**
 * Set signin infomation for further requests.
 */
const { setToken, principal } = useToken();

/**
 * Stores the jwt token with every request for the backend.
 */
const { wrappedFetch } = useWrappedFetch();

async function checkRegistration(email: string): Promise<boolean> {
  return wrappedFetch(
    `https://studentshare-api-backend-gateway-56c3939t.ew.gateway.dev/user/isRegistered?email=${email}`,
    "GET",
    "",
    false
  )
    .then((response) => {
      if (!response.ok)
        throw new Error(
          "An error occured during communication with the server – Registration check failed"
        );
      return response.json();
    })
    .then((jsondata) => {
      return jsondata.data === "true";
    });
}

/**
 * Function for logging in an already registered user via the endpoint api/auth/signin in the backend.
 *
 * @param signInRequest request object that contains all the necessary information for the sign in request
 * @returns promise of jwt token, needed for further requests
 */
async function doSignIn(googleToken: string): Promise<Principal> {
  await wrappedFetch(
    "https://studentshare-api-backend-gateway-56c3939t.ew.gateway.dev/user/login",
    "POST",
    JSON.stringify({ token: googleToken }),
    false
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          "An error occured during communication with the server – SignIn failed"
        );
      }
      return response.json();
    })
    .then((jsondata) => {
      const token = jsondata;
      setToken(token);
    });
  return principal.value;
}

async function doSignUp(
  googleToken: string,
  userCourses: string
): Promise<Principal> {
  await wrappedFetch(
    "https://studentshare-api-backend-gateway-56c3939t.ew.gateway.dev/user/login",
    "POST",
    JSON.stringify({ token: googleToken, courses: userCourses }),
    false
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          "An error occured during communication with the server – SignIn failed"
        );
      }
      return response.json();
    })
    .then((jsondata) => {
      const token = jsondata;
      setToken(token);
    });
  return principal.value;
}

/* ---------------- Export function to use in the components ---------------- */

export function useSignInService() {
  return {
    checkRegistration,
    doSignIn,
    doSignUp,
  };
}
