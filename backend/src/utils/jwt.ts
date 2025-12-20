import '../config/env';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET in environment variables');
}

const secret: string = JWT_SECRET;

export interface JWTPayload {
  userId: number;
  role: 'student' | 'mentor' | 'admin';
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, secret, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, secret);
    
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded && 'role' in decoded) {
      return decoded as JWTPayload;
    }
    
    throw new Error('Invalid token payload structure');
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

