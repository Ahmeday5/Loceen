export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  email: string;
  roles: string[];
  token: string | null;
}

export interface UserData {
  email: string;
  roles: string[];
  token: string | null;
}
