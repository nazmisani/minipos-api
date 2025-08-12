import jwt, { JwtPayload } from "jsonwebtoken";

const secretKey = process.env.SECRET_KEY || "SECRETKEYYYY";

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, secretKey);
}

export function verifyToken(token: string): JwtPayload | string {
  return jwt.verify(token, secretKey);
}
