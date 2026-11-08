import { db, isDbAvailable } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';
import { localStore } from './localStore.ts';

export async function getOrCreateUser(uid: string, email?: string, phoneNumber?: string) {
  try {
    if (await isDbAvailable()) {
      const existing = await db.select().from(users).where(eq(users.uid, uid));
      if (existing.length > 0) {
        const user = existing[0];
        if ((email && !user.email) || (phoneNumber && !user.phoneNumber)) {
          const result = await db.update(users)
            .set({ 
              email: user.email || email,
              phoneNumber: user.phoneNumber || phoneNumber
            })
            .where(eq(users.uid, uid))
            .returning();
          return result[0];
        }
        return user;
      }

      const result = await db.insert(users)
        .values({
          uid,
          email: email || null,
          phoneNumber: phoneNumber || null,
        })
        .onConflictDoUpdate({
          target: users.uid,
          set: {
            email: email || null,
            phoneNumber: phoneNumber || null,
          }
        })
        .returning();
      return result[0];
    }
  } catch (error) {
    // Database query failed, seamlessly fall back to local storage
  }
  return localStore.getOrCreateUser(uid, email, phoneNumber);
}

export async function getUserByUid(uid: string) {
  try {
    if (await isDbAvailable()) {
      const result = await db.select().from(users).where(eq(users.uid, uid));
      if (result[0]) return result[0];
    }
  } catch (error) {
    // Fall back to local store
  }
  return localStore.getUserByUid(uid);
}

