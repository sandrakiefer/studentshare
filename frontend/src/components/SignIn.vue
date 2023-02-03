<template>
  <div>
    <div
      class="container-fluid h-100 fill"
      style="min-height: 100vh !important"
    >
      <div class="row justify-content-sm-center h-100">
        <div class="col-xxl-4 col-xl-5 col-lg-5 col-md-7 col-sm-9 pt-5">
          <img src="./../assets/logo.png" class="img-fluid pb-3" />
          <div class="card text-center mb-2">
            <div class="card-body px-2 py-1">
              <GoogleLogin
                :callback="login"
                class="pt-3"
                :class="{ hidden: isRegistration }"
              />
              <br /><br />
              <div
                v-if="loading"
                class="spinner-border text-light"
                role="status"
                :class="{ hidden: isRegistration }"
              >
                <span class="visually-hidden">Loading...</span>
              </div>
              <div class="newSignIn" :class="{ hidden: !isRegistration }">
                <p class="text-white fw-bold pt-3">
                  Wählen sie aus welchen Fachbereichen sie angehören:
                </p>
                <div
                  v-for="c in courses"
                  :key="c"
                  class="form-check p-1 ms-4 text-center"
                >
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :value="c"
                    v-model="userCourses"
                  />
                  <label class="form-check-label text-white">
                    Fachbereich {{ c }}
                  </label>
                </div>
                <button
                  type="button"
                  class="btn btn-secondary m-3"
                  @click="registration()"
                  :disabled="userCourses.length === 0"
                >
                  Anmeldung abschließen
                </button>
                <br />
                <div
                  v-if="loading"
                  class="spinner-border text-light"
                  role="status"
                >
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { ref } from "vue";
import {
  GoogleLogin,
  decodeCredential,
  CallbackTypes,
} from "vue3-google-login";
import { useSignInService } from "./../service/auth/SignInService";
import router from "./../router";

export default defineComponent({
  name: "SignIn",
  components: {
    GoogleLogin,
  },
  setup() {
    const { checkRegistration, doSignIn, doSignUp } = useSignInService();
    const courses = ref([
      "Architektur und Bauingenieurwesen",
      "Design Informatik Medien",
      "Ingenieurwissenschaften",
      "Sozialwesen",
      "Wiesbaden Business School",
    ]);
    const userCourses = ref([]);
    const loading = ref(false);
    const isRegistration = ref(false);
    const googleToken = ref("");
    const login: CallbackTypes.CredentialCallback = async (response) => {
      googleToken.value = response.credential;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userData: any = decodeCredential(response.credential);
      if (await checkRegistration(userData.email)) {
        loading.value = true;
        await doSignIn(googleToken.value);
        router.push("/files");
        loading.value = false;
      } else {
        isRegistration.value = true;
      }
    };
    const registration = async () => {
      loading.value = true;
      await doSignUp(googleToken.value, userCourses.value.join(","));
      isRegistration.value = false;
      router.push("/files");
      loading.value = false;
    };
    return {
      login,
      registration,
      courses,
      userCourses,
      isRegistration,
      loading,
    };
  },
});
</script>

<style>
.card {
  background-color: transparent !important;
  border-color: transparent !important;
}

.hidden {
  display: none !important;
}
</style>
