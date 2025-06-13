import {hash, compare, genSalt} from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  const salt = await genSalt(10)
  return await hash(password, salt)
}

export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return await compare(password, hashed)
}
