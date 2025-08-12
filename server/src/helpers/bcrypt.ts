import bcrypt from "bcryptjs";

const salt = bcrypt.genSaltSync(10);

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, salt);
}

export function comparePassword(password: string, hashedPassword: string) {
  return bcrypt.compareSync(password, hashedPassword);
}
