import { useWrappedFetch } from "./../../service/principal/FetchService";
import type { File } from "./../../service/files/File";
import { useToken } from "./../../service/principal/PrincipalService";

/**
 * Stores the jwt token with every request for the backend.
 */
const { wrappedFetch } = useWrappedFetch();
const { principal } = useToken();

/* ---------------- Service Function ---------------- */

/**
 * Function for presenting all available files for a registered user. He will only get the files for his majors.
 * All necessary information are given in the jwt token.
 * 
 * @returns an array of file information objects for the main page of the application
 */
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

/**
 * Function to present all the available files from one specific user. Only presenting the files, where the majors overlap.
 * 
 * @param email_adr is the unique id for the user.
 * @returns an array of file information objects.
 */
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

/**
 * Function to filter out all the files from one specific major. 
 * 
 * @param right is one registered major from the user.
 * @returns an array of file information objects filtered by one right.
 */
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

/**
 * Function to delete one file choosen by the user. It will only carry out the action if the user is the owner of the file.
 * All necessary informations are in the jwt token.
 * 
 * @param docname is the unique id of the file the user wants to delete.
 * @returns a boolean, if the action has succeed or not.
 */
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
