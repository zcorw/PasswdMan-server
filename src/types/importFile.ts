export type bitwardenType = {
  folder: string;
  type: 'login' | 'note';
  name: string;
  notes: string;
  fields: string;
  login_uri: string;
  login_username: string;
  login_password: string;
};
