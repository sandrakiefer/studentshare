export interface File {
  filename: string;
  file_id: string;
  owner: string;
  last_change: string;
  fileSize: string;
  rights: Array<string>;
  password: string;
  email: string;
  public: boolean;
}
