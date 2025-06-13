export interface BaseUser {
  email: string;
  password: string;
  [key: string]: any; 
}

export interface CreateAuthOptions<TUser extends BaseUser> {
  secret: string;
  accessTokenExpiry?: string;      // default: '15m'
  refreshTokenExpiry?: string;     // default: '7d'
  getUserByEmail: (email: string) => Promise<TUser | null>;
  getUserById: (id: string) => Promise<TUser | null>; // requerido para refresh
  saveUser: (user: TUser) => Promise<TUser>;
}

export interface RegisterInput extends BaseUser {
  [key: string]: any;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthToken {
  token: string;
  expiresIn: string;
}
