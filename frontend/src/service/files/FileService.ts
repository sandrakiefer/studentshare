import { useWrappedFetch } from "./../../service/principal/FetchService";
import type { File } from "./../../service/files/File";
import { useToken } from "./../../service/principal/PrincipalService";

/**
 * Stores the jwt token with every request for the backend.
 */
const { wrappedFetch } = useWrappedFetch();
const { principal } = useToken();

/* ---------------- Service Function ---------------- */

async function getAllFiles(): Promise<File[]> {
  return wrappedFetch(
    `https://studentshare-api-backend-gateway-56c3939t.ew.gateway.dev/files?token=${principal.value.token.token}`,
    "GET",
    "",
    true
  )
    .then((response) => {
      if (!response.ok)
        throw new Error(
          "An error occured during communication with the server – Registration check failed"
        );
      return response.json();
    })
    .then((json) => {
      return json;
    });
}

async function getUserFiles(email_adr: string): Promise<File[]> {
  return wrappedFetch(
    `https://studentshare-api-backend-gateway-56c3939t.ew.gateway.dev/files/owner/${email_adr}?token=${principal.value.token.token}`,
    "GET",
    "",
    true
  )
    .then((response) => {
      if (!response.ok)
        throw new Error(
          "An error occured during communication with the server – Registration check failed"
        );
      return response.json();
    })
    .then((json) => {
      return json;
    });
}

async function getFilesByRights(right: string): Promise<File[]> {
  return wrappedFetch(
    `https://studentshare-api-backend-gateway-56c3939t.ew.gateway.dev/files/dropdown/${right}?token=${principal.value.token.token}`,
    "GET",
    "",
    true
  )
    .then((response) => {
      if (!response.ok)
        throw new Error(
          "An error occured during communication with the server – Registration check failed"
        );
      return response.json();
    })
    .then((json) => {
      return json;
    });
}

async function deleteFile(docname: string): Promise<boolean> {
  return wrappedFetch(
    `https://studentshare-api-backend-gateway-56c3939t.ew.gateway.dev/files/delete/${docname}?token=${principal.value.token.token}`,
    "POST",
    JSON.stringify({ filename: docname }),
    true
  ).then((response) => {
    if (!response.ok) {
      throw new Error(
        "An error occured during communication with the server – SignIn failed"
      );
      return false;
    }
    return true;
  });
}

/* ---------------- Export function to use in the components ---------------- */

export function useFileService() {
  return {
    getAllFiles,
    getUserFiles,
    deleteFile,
    getFilesByRights,
  };
}
