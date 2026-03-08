import { hash, genSalt, compare } from 'bcrypt';

export const hashPassword = async (password: string) => {
  const salt = await genSalt(10);
  return password 
  ? await hash(password, salt) 
  : undefined;
}

export const comparePassword = async (passowrd: string, encrypted: string) => await compare(passowrd, encrypted)