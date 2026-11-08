import { Router, type Request, type Response } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.ts';
import { localStore } from '../db/localStore.ts';

const router = Router();

// Get current user profile
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    
    let dbUser = req.dbUser;
    
    // Auto-assign ADMIN role to specific email
    if (user.email === 'gowdarakshath17@gmail.com' && dbUser.role !== 'ADMIN') {
      dbUser = localStore.updateUser(user.uid as string, { role: 'ADMIN' } as any) || dbUser;
      dbUser.role = 'ADMIN';
    }

    localStore.logActivity(user.uid as string, 'LOGIN', 'User accessed profile/dashboard');
    res.json(dbUser);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    
    const dbUser = req.dbUser;
    if (dbUser.profileEditsLeft <= 0) {
      if (!dbUser.phoneNumber && req.body.phoneNumber) {
        // bypass
      } else {
        return res.status(403).json({ error: 'No profile edits remaining' });
      }
    }
    
    const updates = {
      ...req.body,
      profileEditsLeft: Math.max(0, (dbUser.profileEditsLeft || 3) - 1)
    };
    
    const updated = localStore.updateUser(user.uid as string, updates);
    res.json(updated);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Sync user data
router.post('/sync', requireAuth, async (req: Request, res: Response) => {
  res.json({ success: true, message: 'User synced locally' });
});

// Get all users (Admin only)
router.get('/all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.dbUser?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json({
      users: localStore.data.users,
      logins: localStore.data.users.map(u => ({ uid: u.uid, email: u.email, lastLogin: u.updatedAt }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
