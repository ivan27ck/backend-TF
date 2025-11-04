import jwt, { type SignOptions, type Secret } from 'jsonwebtoken';
import type { StringValue } from 'ms'; // 👈 tipo que espera jsonwebtoken

const SECRET: Secret = process.env.JWT_SECRET ?? 'change_me';

type Expires = number | StringValue | undefined;
const EXPIRES: Expires =
  (process.env.JWT_EXPIRES_IN as unknown as Expires) ?? ('7d' as StringValue);

export const signToken = (payload: object) =>
  jwt.sign(payload, SECRET, { expiresIn: EXPIRES });

export const verifyToken = <T = any>(token: string): T =>
  jwt.verify(token, SECRET) as T;
