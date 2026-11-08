import fs from 'fs';

const content = `import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';
import { localStore } from '../db/localStore.ts';

const router = Router();

// Get the full Digital Farm Passport for the authenticated user
router.get('/passport', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    
    if (user.uid === 'demo_farmer_karnataka') {
      return res.json([
        {
          id: 'demo_farm_1',
          name: 'Karnataka Farm',
          latitude: '12.9716',
          longitude: '77.5946',
          createdAt: new Date().toISOString(),
          fields: [
            {
              id: 'demo_field_1',
              name: 'Main Field',
              cropCycles: [{ id: 'demo_cycle_1', crop: 'Rice', status: 'VEGETATIVE', isActive: true, createdAt: new Date().toISOString() }],
              soilTests: []
            }
          ]
        }
      ]);
    }
    
    const dbUser = req.dbUser;
    if (dbUser && dbUser.id) {
      const passport = localStore.getUserPassport(dbUser.id);
      return res.json(passport);
    }
    res.json([]);
  } catch (error) {
    console.error('Error fetching farms:', error);
    res.json([]);
  }
});

// Setup a new farm
router.post('/setup', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    
    if (user.uid === 'demo_farmer_karnataka') {
       return res.status(201).json({ message: 'Demo farm setup mock success', farmId: 'demo_farm_2' });
    }
    
    const dbUser = req.dbUser;
    if (dbUser && dbUser.id) {
      const farmId = localStore.setupFarm(dbUser.id, req.body);
      return res.status(201).json({ message: 'Farm passport initialized successfully', farmId });
    }
    res.status(500).json({ error: 'User not found' });
  } catch (error) {
    console.error('Error setting up farm:', error);
    res.status(500).json({ error: 'Failed to initialize farm passport' });
  }
});

// Admin stats
router.get('/admin/stats', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.dbUser?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    res.json({
      totalFarms: localStore.data.farms.length,
      totalFields: localStore.data.fields.length,
      recentSearches: localStore.data.users.map(u => ({ email: u.email, fullName: u.fullName, query: 'General Activity' }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
`;
fs.writeFileSync('src/api/farms.ts', content);
