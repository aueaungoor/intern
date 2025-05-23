export interface Account {
  idaccount?: number;
  username?: string;
  password?: string;
  fname?: string;
  lname?: string;
  description?: string;
  gender?: string;
  birthday?: string; // เช่น "1995-01-15"
  isAdmin?: Boolean;

  available?: boolean;
  message?: String;
}
