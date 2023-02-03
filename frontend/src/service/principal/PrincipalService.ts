import { reactive, ref, computed } from "vue";
import { State } from "./../../service/principal/Principal";
import type {
  Principal,
  Token,
  TokenPayload,
} from "./../../service/principal/Principal";
import { VueCookieNext } from "vue-cookie-next";
import jwt_decode from "jwt-decode";

/* -------------------------------------------------------------------------- */
/*                          Principal service setup.                          */
/* -------------------------------------------------------------------------- */

/**
 * State management for principal.
 */
const principal: Principal = reactive({
  token: { token: "" },
  email: "",
  name: "",
  courses: "",
  expires: 0,
  issuedAt: 0,
});

/**
 * State management for login state.
 */
const state = ref(State.LOGGED_OUT);

/**
 * Clears the saved data for principal from the state.
 * Used to restore the initial state when the user logs out.
 */
function clearStore() {
  principal.token = { token: "" };
  principal.email = "";
  principal.name = "";
  principal.courses = "";
  principal.expires = 0;
  principal.issuedAt = 0;
  VueCookieNext.removeCookie("token");
}

/* -------------------------------------------------------------------------- */
/*                      Functions to set token and state.                     */
/* -------------------------------------------------------------------------- */

/**
 * Processes the information and stores the token in the state and cookies.
 *
 * @param token valid jwt token
 */
function setToken(token: Token) {
  const tokenPayload: TokenPayload = jwt_decode(token.token);
  if (principal !== undefined) {
    principal.token = token;
    principal.email = tokenPayload.email;
    principal.name = tokenPayload.name;
    principal.courses = tokenPayload.courses;
    principal.expires = tokenPayload.exp;
    principal.issuedAt = tokenPayload.iat;
    VueCookieNext.setCookie("token", token.token, {
      expire: principal.expires - principal.issuedAt,
      path: "/",
      domain: "",
      secure: "",
      sameSite: "Lax",
    });
    if (state.value !== undefined) state.value = State.LOGGED_IN;
  }
}

/**
 * Switches the status of authentication to the given value.
 *
 * @param newState status of authentication (loggedin or loggedout)
 */
function setState(newState: State) {
  state.value = newState;
}

/* ---------- Export function to use in the services and components --------- */

export function useToken() {
  const isAuthenticated = computed(() => {
    return (
      principal !== undefined &&
      principal.token.token !== "" &&
      Math.floor(Date.now() / 1000) < principal.expires
    );
  });
  if (!isAuthenticated.value && VueCookieNext.isCookieAvailable("token")) {
    setToken({ token: VueCookieNext.getCookie("token") } as Token);
  }
  return {
    principal: computed(() => principal),
    state: computed(() => state.value),
    setToken,
    setState,
    clearStore,
  };
}
