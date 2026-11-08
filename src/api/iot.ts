import { Router, type Request, type Response } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.ts';
import { localStore } from '../db/localStore.ts';

const router = Router();

// Get devices for a field
router.get('/devices/:fieldId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const fieldId = req.params.fieldId;
    if (!fieldId) return res.status(400).json({ error: 'Invalid field ID' });
    
    if (user?.uid === 'demo_farmer_maharashtra' || user?.uid === 'demo_farmer_karnataka') {
      return res.json({
        devices: [
          { id: 'demo_pump_1', fieldId, name: 'Main Irrigation Pump', deviceType: 'PUMP', status: 'OFF', lastActive: new Date().toISOString() },
          { id: 'demo_valve_1', fieldId, name: 'Drip Line Valve A', deviceType: 'DRIP_VALVE', status: 'OFF', lastActive: new Date().toISOString() },
          { id: 'demo_drone_1', fieldId, name: 'Scout Drone Alpha', deviceType: 'DRONE', status: 'STANDBY', lastActive: new Date().toISOString() }
        ],
        interventions: []
      });
    }
    
    const data = localStore.getIotDevices(Number(fieldId));
    res.json(data);
  } catch (error) {
    console.error('IoT Get Devices Error:', error);
    res.status(500).json({ error: 'Failed to fetch IoT devices' });
  }
});

// Toggle a device or trigger an intervention
router.post('/intervene', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { fieldId, deviceId, action, reason, triggerSource = 'MANUAL' } = req.body;
    
    if (!fieldId || !deviceId || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    let newStatus = 'OFF';
    if (action === 'TURN_ON' || action === 'DISPATCH') newStatus = 'ON';
    if (action === 'TURN_OFF' || action === 'RECALL') newStatus = 'OFF';
    
    if (user?.uid === 'demo_farmer_karnataka') {
      return res.json({ success: true, status: newStatus, mock: true });
    }
    
    localStore.logActivity(user?.uid as string, 'DEVICE_TOGGLE', `Triggered ${action} on device ${deviceId}`);
    localStore.saveIntervention({ fieldId: Number(fieldId), deviceId: Number(deviceId), actionType: action, reason, triggerSource });
    res.json({ success: true, status: newStatus });
  } catch (error) {
    console.error('IoT Intervention Error:', error);
    res.status(500).json({ error: 'Failed to trigger intervention' });
  }
});

export default router;
