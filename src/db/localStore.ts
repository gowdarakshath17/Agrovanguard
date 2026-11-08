import fs from 'fs';
import path from 'path';

interface LocalUser {
  id: number;
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  fullName: string | null;
  preferredLanguage: string;
  profileEditsLeft: number;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LocalFarm {
  id: number;
  userId: number;
  name: string;
  latitude: string | null;
  longitude: string | null;
  region: string | null;
  createdAt: Date;
  updatedAt: Date;
  fields?: any[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'farm_store.json');

class LocalStore {
  public data: {
    users: LocalUser[];
    farms: any[];
    fields: any[];
    cropCycles: any[];
    soilTests: any[];
    iotDevices: any[];
    interventions: any[];
    activityLogs: any[];
    nextId: {
      users: number;
      farms: number;
      fields: number;
      cropCycles: number;
      soilTests: number;
      iotDevices: number;
      interventions: number;
      activityLogs: number;
    };
  };

  constructor() {
    this.data = {
      users: [],
      farms: [],
      fields: [],
      cropCycles: [],
      soilTests: [],
      iotDevices: [],
      interventions: [],
        activityLogs: [],
      nextId: {
        users: 1,
        farms: 1,
        fields: 1,
        cropCycles: 1,
        soilTests: 1,
        iotDevices: 1,
        interventions: 1,
        activityLogs: 1,
      },
    };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load local farm store from disk, initializing fresh:', e);
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Failed to persist local farm store:', e);
    }
  }

  
  logActivity(uid: string, action: string, details: string) {
    const user = this.getUserByUid(uid);
    const log = {
      id: this.data.nextId.activityLogs++,
      userId: user?.id || 0,
      uid,
      email: user?.email || uid,
      action,
      details,
      timestamp: new Date()
    };
    if (!this.data.activityLogs) this.data.activityLogs = [];
    this.data.activityLogs.unshift(log);
    // Keep only last 100 logs to prevent unbounded growth
    if (this.data.activityLogs.length > 100) {
      this.data.activityLogs.pop();
    }
    this.save();
  }

  getOrCreateUser(uid: string, email?: string, phoneNumber?: string): LocalUser {
    let user = this.data.users.find((u) => u.uid === uid);
    if (user) {
      let changed = false;
      if (email && !user.email) {
        user.email = email;
        changed = true;
      }
      if (phoneNumber && !user.phoneNumber) {
        user.phoneNumber = phoneNumber;
        changed = true;
      }
      if (changed) {
        user.updatedAt = new Date();
        this.save();
      }
      return user;
    }

    const newUser: LocalUser = {
      id: this.data.nextId.users++,
      uid,
      email: email || null,
      phoneNumber: phoneNumber || null,
      fullName: email ? email.split('@')[0] : 'Farm Owner',
      preferredLanguage: 'English',
      profileEditsLeft: 3,
      role: 'FARMER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.data.users.push(newUser);
    this.ensureDefaultPassportForUser(newUser.id);
    this.save();
    return newUser;
  }

  getUserByUid(uid: string): LocalUser | null {
    const user = this.data.users.find((u) => u.uid === uid);
    if (user) return user;
    // Auto-create on demand
    return this.getOrCreateUser(uid);
  }

  updateUser(uid: string, updates: Partial<LocalUser>): LocalUser | null {
    const user = this.data.users.find((u) => u.uid === uid);
    if (!user) return null;

    if (updates.fullName !== undefined) user.fullName = updates.fullName;
    if (updates.email !== undefined) user.email = updates.email;
    if (updates.phoneNumber !== undefined) user.phoneNumber = updates.phoneNumber;
    if (updates.preferredLanguage !== undefined) user.preferredLanguage = updates.preferredLanguage;
    if (updates.profileEditsLeft !== undefined) user.profileEditsLeft = updates.profileEditsLeft;
    user.updatedAt = new Date();

    this.save();
    return user;
  }

  ensureDefaultPassportForUser(userId: number) {
    const existing = this.data.farms.find((f) => f.userId === userId);
    if (existing) return;

    const farmId = this.data.nextId.farms++;
    const farm: LocalFarm = {
      id: farmId,
      userId,
      name: 'Sahyadri Agro Farms (Vidarbha Sector)',
      latitude: '20.9374',
      longitude: '77.7796',
      region: 'Amravati / Vidarbha, Maharashtra',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.farms.push(farm);

    const fieldId = this.data.nextId.fields++;
    const field = {
      id: fieldId,
      farmId,
      name: 'Black Soil Plot Alpha',
      areaAcres: '12.5',
      irrigationType: 'Drip System',
      createdAt: new Date(),
    };
    this.data.fields.push(field);

    const cycleId = this.data.nextId.cropCycles++;
    const cycle = {
      id: cycleId,
      fieldId,
      crop: 'Cotton',
      variety: 'BT Cotton (Bollgard II)',
      sowingDate: new Date(Date.now() - 42 * 86400000),
      isActive: true,
      status: 'VEGETATIVE',
      createdAt: new Date(),
    };
    this.data.cropCycles.push(cycle);

    const testId = this.data.nextId.soilTests++;
    const soil = {
      id: testId,
      fieldId,
      ph: '6.8',
      ec: '0.9',
      nitrogen: '280',
      phosphorus: '22',
      potassium: '310',
      organicCarbon: '0.65',
      sourceType: 'LAB_TEST',
      confidence: 'HIGH',
      testDate: new Date(Date.now() - 7 * 86400000),
    };
    this.data.soilTests.push(soil);

    // Default IoT devices
    const dev1 = { id: this.data.nextId.iotDevices++, fieldId, name: 'Main Irrigation Pump', deviceType: 'PUMP', status: 'ON', lastActive: new Date() };
    const dev2 = { id: this.data.nextId.iotDevices++, fieldId, name: 'Plot A Drip Line Valve', deviceType: 'DRIP_VALVE', status: 'OFF', lastActive: new Date() };
    const dev3 = { id: this.data.nextId.iotDevices++, fieldId, name: 'Autonomous Scout Drone', deviceType: 'DRONE', status: 'STANDBY', lastActive: new Date() };
    this.data.iotDevices.push(dev1, dev2, dev3);

    this.save();
  }

  getUserPassport(userId: number) {
    this.ensureDefaultPassportForUser(userId);
    const userFarms = this.data.farms.filter((f) => f.userId === userId);
    return userFarms.map((farm) => {
      const farmFields = this.data.fields.filter((f) => f.farmId === farm.id);
      const fieldsWithRelations = farmFields.map((field) => {
        const fieldCycles = this.data.cropCycles.filter((c) => c.fieldId === field.id && c.isActive);
        const fieldSoil = this.data.soilTests.filter((s) => s.fieldId === field.id);
        return {
          ...field,
          cropCycles: fieldCycles.length > 0 ? [fieldCycles[0]] : [],
          soilTests: fieldSoil.length > 0 ? [fieldSoil[0]] : [],
        };
      });
      return {
        ...farm,
        fields: fieldsWithRelations,
      };
    });
  }

  setupFarm(userId: number, body: { farmName?: string; location?: any; fieldName?: string; crop?: string; variety?: string; sowingDate?: string }) {
    const farmId = this.data.nextId.farms++;
    const farm = {
      id: farmId,
      userId,
      name: body.farmName || 'My Farm',
      latitude: body.location?.lat ? String(body.location.lat) : '19.0760',
      longitude: body.location?.lon ? String(body.location.lon) : '72.8777',
      region: 'Primary Agricultural Zone',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.farms.push(farm);

    const fieldId = this.data.nextId.fields++;
    const field = {
      id: fieldId,
      farmId,
      name: body.fieldName || 'Main Field',
      areaAcres: '10.0',
      irrigationType: 'Drip System',
      createdAt: new Date(),
    };
    this.data.fields.push(field);

    if (body.crop) {
      const cycleId = this.data.nextId.cropCycles++;
      this.data.cropCycles.push({
        id: cycleId,
        fieldId,
        crop: body.crop,
        variety: body.variety || null,
        sowingDate: body.sowingDate ? new Date(body.sowingDate) : new Date(),
        isActive: true,
        status: 'VEGETATIVE',
        createdAt: new Date(),
      });
    }

    this.save();
    return farmId;
  }

  getIotDevices(fieldId: number) {
    let devices = this.data.iotDevices.filter((d) => d.fieldId === fieldId);
    if (devices.length === 0) {
      const dev1 = { id: this.data.nextId.iotDevices++, fieldId, name: 'Main Irrigation Pump', deviceType: 'PUMP', status: 'ON', lastActive: new Date() };
      const dev2 = { id: this.data.nextId.iotDevices++, fieldId, name: 'Plot A Drip Line Valve', deviceType: 'DRIP_VALVE', status: 'OFF', lastActive: new Date() };
      const dev3 = { id: this.data.nextId.iotDevices++, fieldId, name: 'Autonomous Scout Drone', deviceType: 'DRONE', status: 'STANDBY', lastActive: new Date() };
      this.data.iotDevices.push(dev1, dev2, dev3);
      devices = [dev1, dev2, dev3];
      this.save();
    }
    const interventions = this.data.interventions
      .filter((i) => i.fieldId === fieldId)
      .slice(-10)
      .reverse();
    return { devices, interventions };
  }

  saveIntervention(data: { fieldId: number; deviceId?: number; actionType: string; reason?: string; triggerSource?: string }) {
    const id = this.data.nextId.interventions++;
    const intervention = {
      id,
      ...data,
      createdAt: new Date(),
    };
    this.data.interventions.push(intervention);

    if (data.deviceId) {
      const dev = this.data.iotDevices.find((d) => d.id === data.deviceId);
      if (dev) {
        if (data.actionType === 'TURN_ON' || data.actionType === 'DISPATCH') dev.status = 'ON';
        if (data.actionType === 'TURN_OFF' || data.actionType === 'RECALL') dev.status = 'OFF';
        dev.lastActive = new Date();
      }
    }
    this.save();
    return intervention;
  }
}

export const localStore = new LocalStore();
