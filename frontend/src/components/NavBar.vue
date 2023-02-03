<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark static-top">
      <div class="container">
        <a class="navbar-brand" href="#">
          <img src="./../assets/logo.png" height="36" />
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <a class="nav-link" href="#" @click="logout()">
                <i class="bi bi-box-arrow-left px-2"></i>
                Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { useToken } from "./../service/principal/PrincipalService";
import { googleSdkLoaded } from "vue3-google-login";
import { State } from "./../service/principal/Principal";
import router from "../router";

export default defineComponent({
  name: "NavBar",
  setup() {
    const { principal, setState, clearStore } = useToken();
    const logout = () => {
      googleSdkLoaded((google) => {
        google.accounts.id.revoke(principal.value.email, async () => {
          setState(State.LOGGED_OUT);
          clearStore();
          await router.push("/");
        });
      });
    };
    return {
      logout,
    };
  },
});
</script>
