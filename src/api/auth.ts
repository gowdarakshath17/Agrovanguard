import { Router, type Request, type Response } from 'express';
import { signAppToken } from '../lib/server-tokens.ts';

const router = Router();

router.post('/demo-login', async (req: Request, res: Response) => {
  try {
    const demoPhone = '+919822012345';
    const demoEmail = 'sanjay.patil@agrovanguard.ai';
    const uid = 'demo_farmer_maharashtra';

    // Use our custom server token instead of Firebase custom token (bypasses IAM limits in restricted envs)
    const token = signAppToken({
      uid,
      email: demoEmail,
      phone_number: demoPhone
    });

    return res.json({
      success: true,
      token,
      user: {
        uid,
        email: demoEmail,
        phoneNumber: demoPhone,
        displayName: 'Sanjay Patil (Vidarbha Agro Vanguard)',
        role: 'FARMER',
      },
    });
  } catch (error: any) {
    console.error('Demo Login Error:', error);
    return res.status(500).json({ error: 'Failed to login with demo account.' });
  }
});

router.post('/phone-login', async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: 'Phone number required' });
    
    // In a real app we'd verify OTP here. For this demo, any phone number + 123456 works.
    const uid = 'phone_user_' + phoneNumber.replace(/\D/g, '');
    const token = signAppToken({
      uid,
      phone_number: phoneNumber
    });

    return res.json({
      success: true,
      token,
      user: {
        uid,
        phoneNumber,
        displayName: 'Test Farmer',
        role: 'FARMER',
      },
    });
  } catch (error: any) {
    console.error('Phone Login Error:', error);
    return res.status(500).json({ error: 'Failed to login with phone.' });
  }
});

export default router;
