import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'super_secret_evalora_key_2025';

export interface TokenPayload {
  userId: string;
  role: 'Dosen' | 'Administrator Akademik' | 'Mahasiswa';
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '8h' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET_KEY) as TokenPayload;
  } catch (err) {
    return null;
  }
}
