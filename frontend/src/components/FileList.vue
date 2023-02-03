<template>
  <div>
    <div class="row m-2 p-4">
      <div class="col-12 dropdown-center text-center">
        <button
          class="btn btn-secondary dropdown-toggle"
          type="button"
          id="dropdownMenuButton"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          {{ selectedCourse }}
        </button>
        <ul
          class="dropdown-menu dropdown-menu-dark"
          aria-labelledby="dropdownMenuButton"
        >
          <li v-for="c in courses" :key="c">
            <a class="dropdown-item" href="#" @click="clickDropdown(c)">{{
              c
            }}</a>
          </li>
        </ul>
      </div>
    </div>
    <div class="row d-flex align-items-center justify-content-center m-2 pb-2">
      <div class="col-9 col-sm-10 col-md-11">
        <form>
          <div class="input-group border rounded-pill p-1">
            <div class="input-group-prepend border-0">
              <button
                id="button-addon4"
                type="button"
                class="btn btn-link text-white"
              >
                <i class="bi bi-search"></i>
              </button>
            </div>
            <input
              type="search"
              placeholder="Search for file ..."
              v-model="keyword"
              class="form-control bg-dark border-0 text-white me-2"
            />
          </div>
        </form>
      </div>
      <div class="col-3 col-sm-2 col-md-1">
        <div class="image-upload" style="width: 1px">
          <label for="file-input">
            <i
              class="bi bi-cloud-arrow-up text-white border rounded-pill py-2 px-3"
              style="font-size: 1.5rem; cursor: pointer"
            ></i>
          </label>
          <input
            id="file-input"
            type="file"
            @change="onFileSelected"
            style="width: 1px"
            required
          />
        </div>
      </div>
    </div>
    <div class="row m-2 pb-5">
      <div class="col-12">
        <table class="table table-dark table-hover">
          <thead>
            <tr>
              <th scope="col"></th>
              <th scope="col" @click="sortTable(1)">
                Name
                <span v-if="1 == sortColumn">
                  <i v-if="ascending" class="bi bi-caret-up-fill"></i>
                  <i v-else class="bi bi-caret-down-fill"></i>
                </span>
              </th>
              <th
                class="d-none d-md-table-cell"
                scope="col"
                @click="sortTable(2)"
              >
                Owner
                <span v-if="2 == sortColumn">
                  <i v-if="ascending" class="bi bi-caret-up-fill"></i>
                  <i v-else class="bi bi-caret-down-fill"></i>
                </span>
              </th>
              <th
                class="d-none d-lg-table-cell"
                scope="col"
                @click="sortTable(3)"
              >
                Last Change
                <span v-if="3 == sortColumn">
                  <i v-if="ascending" class="bi bi-caret-up-fill"></i>
                  <i v-else class="bi bi-caret-down-fill"></i>
                </span>
              </th>
              <th
                class="d-none d-lg-table-cell"
                scope="col"
                @click="sortTable(4)"
              >
                Filesize
                <span v-if="4 == sortColumn">
                  <i v-if="ascending" class="bi bi-caret-up-fill"></i>
                  <i v-else class="bi bi-caret-down-fill"></i>
                </span>
              </th>
              <th scope="col"></th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody class="table-group-divider">
            <tr v-for="(file, index) in fileList" :key="index">
              <td>
                <i
                  v-if="
                    file.filename.split('.')[
                      file.filename.split('.').length - 1
                    ] == 'zip'
                  "
                  class="bi bi-file-zip"
                ></i>
                <i
                  v-else
                  :class="
                    'bi bi-filetype-' +
                    file.filename.split('.')[
                      file.filename.split('.').length - 1
                    ]
                  "
                ></i>
              </td>
              <td class="text-truncate" style="max-width: calc(50 * 1vw)">
                {{ file.filename }}
              </td>
              <td
                class="d-none d-md-table-cell"
                @click="showUserFiles(file.email)"
                style="cursor: pointer"
              >
                {{ file.owner }}
              </td>
              <td class="d-none d-lg-table-cell">
                {{ file.last_change }}
              </td>
              <td class="d-none d-lg-table-cell">{{ file.fileSize }}</td>
              <td>
                <i
                  class="bi bi-file-earmark-arrow-down"
                  @click="downloadWithAxios(file.file_id, file.filename)"
                  style="cursor: pointer"
                ></i>
              </td>
              <td>
                <i
                  v-if="file.email === useremail"
                  class="bi bi-file-earmark-x"
                  @click="deleteAllInstances(file.file_id)"
                  style="cursor: pointer"
                ></i>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ref, onMounted, defineComponent } from "@vue/runtime-core";
import { useToken } from "../service/principal/PrincipalService";
import { useFileService } from "../service/files/FileService";
import type { File } from "../service/files/File";
import axios from "axios";
// v-if="file.owner === username"

export default defineComponent({
  name: "FileList",
  setup() {
    const { principal } = useToken();
    const { getAllFiles, deleteFile, getFilesByRights, getUserFiles } =
      useFileService();
    const testFiles = ref<File[]>();
    const useremail = ref(principal.value.email);
    const keyword = ref("");
    const selectedCourse = ref("Choose your field of study");
    const fileList = computed(() => {
      if (testFiles.value) {
        const n: number = keyword.value.length;
        if (n < 1) {
          return testFiles.value;
        } else {
          return testFiles.value.filter(
            (e) =>
              e.filename.toLowerCase().includes(keyword.value.toLowerCase()) ||
              e.owner.toLowerCase().includes(keyword.value.toLowerCase()) ||
              e.last_change
                .toLowerCase()
                .includes(keyword.value.toLowerCase()) ||
              e.fileSize.toLowerCase().includes(keyword.value.toLowerCase())
          );
        }
      }
    });
    const courses = ref(principal.value.courses.split(","));
    const ascending = ref(false);
    const sortColumn = ref(0);
    onMounted(async () => {
      showFiles();
    });
    function sortTable(col: number) {
      if (sortColumn.value === col) {
        ascending.value = !ascending.value;
      } else {
        ascending.value = true;
        sortColumn.value = col;
      }
      if (col === 1 && fileList.value) {
        ascending.value
          ? fileList.value.sort(
              (
                a: {
                  filename: string;
                  owner: string;
                  last_change: string;
                  fileSize: string;
                },
                b: {
                  filename: string;
                  owner: string;
                  last_change: string;
                  fileSize: string;
                }
              ) =>
                a.filename > b.filename ? 1 : b.filename > a.filename ? -1 : 0
            )
          : fileList.value.sort(
              (
                a: {
                  filename: string;
                  owner: string;
                  last_change: string;
                  fileSize: string;
                },
                b: {
                  filename: string;
                  owner: string;
                  last_change: string;
                  fileSize: string;
                }
              ) =>
                b.filename > a.filename ? 1 : a.filename > b.filename ? -1 : 0
            );
      }
      if (col === 2 && fileList.value) {
        ascending.value
          ? fileList.value.sort(
              (
                a: {
                  filename: string;
                  owner: string;
                  last_change: string;
                  fileSize: string;
                },
                b: {
                  filename: string;
                  owner: string;
                  last_change: string;
                  fileSize: string;
                }
              ) => (a.owner > b.owner ? 1 : b.owner > a.owner ? -1 : 0)
            )
          : fileList.value.sort(
              (
                a: {
                  filename: string;
                  owner: string;
                  last_change: string;
                  fileSize: string;
                },
                b: {
                  filename: string;
                  owner: string;
                  last_change: string;
                  fileSize: string;
                }
              ) => (b.owner > a.owner ? 1 : a.owner > b.owner ? -1 : 0)
            );
      }
      if (col === 3 && fileList.value) {
        ascending.value
          ? fileList.value.sort(
              (
                a: {
                  filename: string;
                  owner: string;
                  last_change: string;
                  fileSize: string;
                },
                b: {
                  filename: string;
                  owner: string;
                  last_change: string;
                  fileSize: string;
                }
              ) =>
                a.last_change > b.last_change
                  ? 1
                  : b.last_change > a.last_change
                  ? -1
                  : 0
            )
          : fileList.value.sort(
              (
                a: {
                  filename: string;
                  owner: string;
                  last_change: string;
                  fileSize: string;
                },
                b: {
                  filename: string;
                  owner: string;
                  last_change: string;
                  fileSize: string;
                }
              ) =>
                b.last_change > a.last_change
                  ? 1
                  : a.last_change > b.last_change
                  ? -1
                  : 0
            );
      }
      if (col === 4 && fileList.value) {
        ascending.value
          ? fileList.value.sort(
              (
                a: {
                  filename: string;
                  owner: string;
                  last_change: string;
                  fileSize: string;
                },
                b: {
                  filename: string;
                  owner: string;
                  last_change: string;
                  fileSize: string;
                }
              ) => {
                const aSize: number = parseInt(a.fileSize.split(" ")[0]);
                const bSize: number = parseInt(b.fileSize.split(" ")[0]);
                return aSize - bSize;
              }
            )
          : fileList.value.sort(
              (
                a: {
                  filename: string;
                  owner: string;
                  last_change: string;
                  fileSize: string;
                },
                b: {
                  filename: string;
                  owner: string;
                  last_change: string;
                  fileSize: string;
                }
              ) => {
                const aSize: number = parseInt(a.fileSize.split(" ")[0]);
                const bSize: number = parseInt(b.fileSize.split(" ")[0]);
                return bSize - aSize;
              }
            );
      }
    }
    async function showUserFiles(email: string) {
      await getUserFiles(email).then((response) => {
        testFiles.value = response;
      });
    }
    async function clickDropdown(right: string) {
      await getFilesByRights(right).then((response) => {
        selectedCourse.value = right;
        testFiles.value = response;
      });
    }
    async function deleteAllInstances(docname: string) {
      await deleteFile(docname);
      if (testFiles.value) {
        testFiles.value = testFiles.value.filter(
          (item) => !item.file_id.includes(docname)
        );
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function onFileSelected(event: any) {
      let file = event.target.files[0];

      if (file != undefined) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const result = await axios
            .post(
              `https://studentshare-api-backend-gateway-56c3939t.ew.gateway.dev/files/upload?token=${principal.value.token.token}`,
              formData,
              {
                headers: {
                  Authorization: `Bearer ${principal.value.token.token}`,
                },
              }
            )
            .then((response) => {
              return response;
            });
          if (result) {
            setTimeout(async () => {
              await showFiles();
            }, 1000);
            setTimeout(async () => {
              await showFiles();
            }, 2000);
          }
        } catch (err) {
          console.log(err);
        }
      }
    }
    async function showFiles() {
      await getAllFiles().then((response) => {
        testFiles.value = response;
      });
    }
    async function downloadWithAxios(id: string, title: string) {
      axios
        .get(
          `https://studentshare-api-backend-gateway-56c3939t.ew.gateway.dev/files/download/${id}?token=${principal.value.token.token}`,
          {
            responseType: "arraybuffer",
            headers: {
              Authorization: `Bearer ${principal.value.token.token}`,
            },
          }
        )
        .then((response) => {
          forceFileDownload(response, title);
        })
        .catch(() => console.log("error occured"));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function forceFileDownload(response: any, title: string) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", title);
      document.body.appendChild(link);
      link.click();
    }
    return {
      keyword,
      fileList,
      ascending,
      sortColumn,
      sortTable,
      courses,
      showFiles,
      downloadWithAxios,
      onFileSelected,
      deleteAllInstances,
      clickDropdown,
      showUserFiles,
      useremail,
      selectedCourse,
    };
  },
});
</script>

<style lang="css">
.form-control:focus {
  border-color: white !important;
  -webkit-box-shadow: none !important;
  box-shadow: none !important;
}
.image-upload > input {
  display: none;
}
</style>
