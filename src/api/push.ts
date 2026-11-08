import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../middleware/auth.ts';
import { getMessaging } from 'firebase-admin/messaging';
import '../lib/firebase-admin.ts'; // ensure it's initialized

const router = Router();

router.post('/register', requireAuth, async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    // Real app: Save token to user profile
    console.log(`[Push API] Registered FCM Token for user ${(req as any).user?.uid}:`, token.substring(0, 20) + '...');
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/test', requireAuth, async (req: Request, res: Response) => {
  try {
    const { token, type } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'No FCM token provided' });
    }

    let title = 'Agro Vanguard Alert';
    let body = 'Important update regarding your farm.';

    if (type === 'weather') {
       title = '⚠️ Critical Weather Alert';
       body = 'Heavy rainfall expected in the next 2 hours. Secure loose equipment and ensure drainage.';
    } else if (type === 'pest') {
       title = '🐛 Pest Warning';
       body = 'High risk of Fall Armyworm detected in your region. Inspect crops immediately.';
    } else if (type === 'maintenance') {
       title = '🚜 Maintenance Reminder';
       body = 'It is time for your scheduled fertilizer application (Nitrogen).';
    }

    const message = {
      notification: { title, body },
      token: token,
    };

    const response = await getMessaging().send(message);
    res.json({ success: true, messageId: response });
  } catch (err: any) {
    console.error('FCM Send Error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
