import {
  BaseUser,
  CreateAuthOptions,

} from './types/types';
import { hashPassword, comparePassword } from './password';
import { generateToken, verifyToken } from './jwt';
import { validate } from './validators/validate';
import { RegisterSchema, RegisterInput } from './validators/register';
import { LoginSchema, LoginInput } from './validators/login';

export function createAuth<TUser extends BaseUser>({
  secret,
  getUserByEmail,
  saveUser,
  accessTokenExpiry = '15m',
  refreshTokenExpiry = '7d',
  getUserById
}: CreateAuthOptions<TUser>) {

  async function register(data: RegisterInput) {
    const result = validate(RegisterSchema, data);
    if (!result.success) return result;

    const { email, password, ...rest } = result.data;
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return {
        success: false,
        status: 400,
        message: 'User already exists'
      };
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await saveUser({ email, password: hashedPassword, ...rest } as TUser);
    const { password: _, ...user } = newUser;

    return { success: true, status: 201, user };
  }

  async function login(data: LoginInput): Promise<
    | { success: true; accessToken: string; refreshToken: string; expiresIn: string }
    | { success: false; status: number; message: string }
  > {
    const result = validate(LoginSchema, data);
    if (!result.success) return result;

    const { email, password } = result.data;
    const user = await getUserByEmail(email);
    if (!user) return { success: false, status: 404, message: 'User not found' };

    const valid = await comparePassword(password, user.password);
    if (!valid) return { success: false, status: 401, message: 'Invalid credentials' };

    const { password: _, ...userSafe } = user;

    const accessToken = generateToken(
      { ...userSafe, type: 'access' },
      secret,
      { expiresIn: accessTokenExpiry }
    );

    const refreshToken = generateToken(
      { id: user.id, type: 'refresh', version: user.refreshTokenVersion ?? 1 },
      secret,
      { expiresIn: refreshTokenExpiry }
    );

    return {
      success: true,
      accessToken,
      refreshToken,
      expiresIn: accessTokenExpiry
    };
  }


  function verify(token: string):
    | { success: true; status: number; payload: any }
    | { success: false; status: number; message: string } {

    try {
      const payload = verifyToken(token, secret);
      console.log('Payload:', payload);
      if (!payload) {
        return { success: false, status: 401, message: 'Invalid or expired token' };
      }
      if(payload === null) {
        return { success: false, status: 401, message: 'Invalid or expired token' };
      }
      return { success: true, status: 200, payload };
    } catch {
      return { success: false, status: 401, message: 'Invalid or expired token' };
    }
    
  }

  async function refresh(refreshToken: string) {
    try {
      const payload = verifyToken(refreshToken, secret) as {
        id: string;
        type: string;
        version: number;
      };

      if (payload.type !== 'refresh') {
        return { success: false, status: 400, message: 'Invalid token type' };
      }

      const user = await getUserById(payload.id); // debes tener esta función
      if (!user || (user.refreshTokenVersion ?? 1) !== payload.version) {
        return { success: false, status: 401, message: 'Token has been invalidated' };
      }

      const { password: _, ...userSafe } = user;

      const accessToken = generateToken(
        { ...userSafe, type: 'access' },
        secret,
        { expiresIn: accessTokenExpiry }
      );

      return { success: true, accessToken, expiresIn: accessTokenExpiry };
    } catch {
      return { success: false, status: 401, message: 'Invalid or expired token' };
    }
  }


  return { register, login, verify, refresh };
}
