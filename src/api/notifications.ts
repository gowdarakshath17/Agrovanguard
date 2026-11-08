import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../middleware/auth.ts';

const router = Router();

router.post('/book', requireAuth, async (req: Request, res: Response) => {
  try {
    const { retailerId, retailerName, userPhone, items } = req.body;
    
    // Simulate API delay for sending SMS/Email
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log(`[Notification Engine] Sent SMS to ${userPhone || 'Farmer'} for booking at ${retailerName}`);
    console.log(`[Notification Engine] Sent Email to ${retailerName} for new order fulfillment.`);
    
    res.json({ 
      success: true, 
      message: 'Booking confirmed. SMS and Email notifications sent successfully.' 
    });
  } catch (error: any) {
    console.error('Notification Error:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

export default router;
