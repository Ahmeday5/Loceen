// employee type
export interface allAppUser {
  id: string;
  email: string;
  roles: string[];
}

export interface AppUsersResponse {
  statusCode?: number;
  message?: string;
  data: allAppUser[];
}
