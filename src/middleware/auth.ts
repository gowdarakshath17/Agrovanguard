import type { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { getOrCreateUser } from '../db/users.ts';
import { verifyAppToken } from '../lib/server-tokens.ts';

export interface AuthRequest extends Request {
  user?: DecodedIdToken | { uid: string; email?: string; phone_number?: string };
  dbUser?: any;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  
  // 1. Try Firebase Admin ID Token verification first
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    try {
      req.dbUser = await getOrCreateUser(decodedToken.uid, decodedToken.email, decodedToken.phone_number);
    } catch {
      req.dbUser = { id: 1, uid: decodedToken.uid, email: decodedToken.email, role: 'FARMER', profileEditsLeft: 3 };
    }
    return next();
  } catch (firebaseErr) {
    // 2. Fallback to server-issued app session token (for Phone OTP and Demo access)
    try {
      const appUser = verifyAppToken(token);
      if (appUser) {
        req.user = appUser;
        try {
          req.dbUser = await getOrCreateUser(appUser.uid, appUser.email, appUser.phone_number);
        } catch {
          req.dbUser = { id: 1, uid: appUser.uid, email: appUser.email, role: 'FARMER', profileEditsLeft: 3 };
        }
        return next();
      }
    } catch (appErr) {
      console.error('Error verifying app token:', appErr);
    }

    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};
