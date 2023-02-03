import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import FileShareView from "@/views/FileShareView.vue";
import SignInView from "@/views/SignInView.vue";
import { useToken } from "@/service/principal/PrincipalService";
import { State } from "@/service/principal/Principal";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "SignIn",
    component: SignInView,
    meta: { title: "StudenShare - SignIn" },
  },
  {
    path: "/files",
    name: "Files",
    component: FileShareView,
    meta: { title: "StudenShare - Files" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const { state } = useToken();

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title}`;
  // next()
  const openForAllRoutes = [/^\/\/?$/g];
  const isAuthenticated = state.value === State.LOGGED_IN;
  if (openForAllRoutes.some((r) => r.test(to.path)) || isAuthenticated) {
    next();
  } else {
    next({ name: "SignIn" });
  }
});

export default router;
