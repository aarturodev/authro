import {sign, verify} from 'jsonwebtoken'

export function generateToken(payload: object, secret: string, options?: object): string {
  return sign(payload, secret, options)
}

export function verifyToken(token: string, secret: string): object | null {
  try {
    return verify(token, secret) as object
  } catch {
    return null
  }
}

