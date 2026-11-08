import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, jsonb, numeric, integer, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email'), // Nullable for phone-only signups
  phoneNumber: text('phone_number'),
  fullName: text('full_name'),
  preferredLanguage: text('preferred_language').default('English'),
  profileEditsLeft: integer('profile_edits_left').default(3).notNull(),
  role: text('role').notNull().default('FARMER'), // FARMER, FIELD_WORKER, AGRICULTURE_EXPERT, DISTRICT_OFFICER, ADMIN
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const weatherCache = pgTable('weather_cache', {
  id: serial('id').primaryKey(),
  locationKey: text('location_key').notNull().unique(), // e.g., "19.0760,72.8777"
  data: jsonb('data').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Digital Farm Passport
export const farms = pgTable('farms', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(), // e.g., "North Valley Farm"
  latitude: numeric('latitude'),
  longitude: numeric('longitude'),
  region: text('region'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const fields = pgTable('fields', {
  id: serial('id').primaryKey(),
  farmId: integer('farm_id').references(() => farms.id).notNull(),
  name: text('name').notNull(), // e.g., "Plot A"
  areaAcres: numeric('area_acres'),
  irrigationType: text('irrigation_type'), // Rainfed, Drip, Sprinkler, Canal
  createdAt: timestamp('created_at').defaultNow(),
});

export const cropCycles = pgTable('crop_cycles', {
  id: serial('id').primaryKey(),
  fieldId: integer('field_id').references(() => fields.id).notNull(),
  crop: text('crop').notNull(), // Cotton, Tomato, Paddy
  variety: text('variety'),
  sowingDate: timestamp('sowing_date'),
  isActive: boolean('is_active').default(true),
  status: text('status').default('VEGETATIVE'), // SEEDLING, VEGETATIVE, FLOWERING, FRUITING, HARVESTED
  createdAt: timestamp('created_at').defaultNow(),
});

export const soilTests = pgTable('soil_tests', {
  id: serial('id').primaryKey(),
  fieldId: integer('field_id').references(() => fields.id).notNull(),
  ph: numeric('ph'),
  ec: numeric('ec'),
  nitrogen: numeric('nitrogen'),
  phosphorus: numeric('phosphorus'),
  potassium: numeric('potassium'),
  organicCarbon: numeric('organic_carbon'),
  sourceType: text('source_type').notNull(), // LAB_TEST, VISUAL_ESTIMATE, HISTORICAL
  confidence: text('confidence').notNull().default('LOW'), // HIGH (Lab), LOW (Estimate)
  testDate: timestamp('test_date').defaultNow(),
});

export const farmCases = pgTable('farm_cases', {
  id: serial('id').primaryKey(),
  fieldId: integer('field_id').references(() => fields.id).notNull(),
  status: text('status').default('OPEN').notNull(), // OPEN, REVIEW_REQUESTED, RESOLVED
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const casePredictions = pgTable('case_predictions', {
  id: serial('id').primaryKey(),
  caseId: integer('case_id').references(() => farmCases.id).notNull(),
  modelType: text('model_type').notNull(), // DISEASE, PEST, SEVERITY
  prediction: text('prediction').notNull(),
  confidence: numeric('confidence').notNull(),
  severity: text('severity'), // LOW, MODERATE, HIGH
  explanation: text('explanation'),
  evidenceLevel: text('evidence_level').default('AI_INFERENCE').notNull(), // AI_INFERENCE, EXPERT_VALIDATION, FIELD_OUTCOME
  createdAt: timestamp('created_at').defaultNow(),
});

// Phase 5: IoT & Automated Interventions
export const iotDevices = pgTable('iot_devices', {
  id: serial('id').primaryKey(),
  fieldId: integer('field_id').references(() => fields.id).notNull(),
  name: text('name').notNull(), // e.g., "Main Water Pump", "Sector 1 Drip Valve"
  deviceType: text('device_type').notNull(), // PUMP, DRIP_VALVE, DRONE
  status: text('status').default('OFF').notNull(), // ON, OFF, ERROR, DEPLOYED
  lastActive: timestamp('last_active').defaultNow(),
});

export const interventions = pgTable('interventions', {
  id: serial('id').primaryKey(),
  fieldId: integer('field_id').references(() => fields.id).notNull(),
  deviceId: integer('device_id').references(() => iotDevices.id),
  triggerSource: text('trigger_source').notNull(), // MANUAL, AI_AUTOMATION
  actionType: text('action_type').notNull(), // TURNED_ON, TURNED_OFF, DISPATCHED
  reason: text('reason'), // e.g., "High heat stress detected by Weather AI"
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  farms: many(farms),
}));

export const farmsRelations = relations(farms, ({ one, many }) => ({
  user: one(users, { fields: [farms.userId], references: [users.id] }),
  fields: many(fields),
}));

export const fieldsRelations = relations(fields, ({ one, many }) => ({
  farm: one(farms, { fields: [fields.farmId], references: [farms.id] }),
  cropCycles: many(cropCycles),
  soilTests: many(soilTests),
  iotDevices: many(iotDevices),
  interventions: many(interventions),
  farmCases: many(farmCases),
}));

export const iotDevicesRelations = relations(iotDevices, ({ one, many }) => ({
  field: one(fields, { fields: [iotDevices.fieldId], references: [fields.id] }),
  interventions: many(interventions),
}));

export const interventionsRelations = relations(interventions, ({ one }) => ({
  field: one(fields, { fields: [interventions.fieldId], references: [fields.id] }),
  device: one(iotDevices, { fields: [interventions.deviceId], references: [iotDevices.id] }),
}));

export const cropCyclesRelations = relations(cropCycles, ({ one }) => ({
  field: one(fields, { fields: [cropCycles.fieldId], references: [fields.id] }),
}));

export const soilTestsRelations = relations(soilTests, ({ one }) => ({
  field: one(fields, { fields: [soilTests.fieldId], references: [fields.id] }),
}));

export const farmCasesRelations = relations(farmCases, ({ one, many }) => ({
  field: one(fields, { fields: [farmCases.fieldId], references: [fields.id] }),
  predictions: many(casePredictions),
}));

export const casePredictionsRelations = relations(casePredictions, ({ one }) => ({
  case: one(farmCases, { fields: [casePredictions.caseId], references: [farmCases.id] }),
}));
