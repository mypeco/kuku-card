import Dexie from 'dexie'

export const db = new Dexie('KukuCardDB')
db.version(1).stores({
  users:         '++id, profileId',
  userSettings:  '++id, &userId',
  masterHistory: '++id, userId, date',
  easyData:      '++id, &userId',
  // stubs required by ProfileSelect's delete logic
  settings:  '++id, userId',
  practices: '++id, userId',
  bestShots:  '++id, userId',
  readWords:  '++id, userId',
})

const DEFAULT_SETTINGS = { isSoundEnabled: true, isReadingVisible: true, handedness: 'right' }

export async function getUserSettings(userId) {
  const rec = await db.userSettings.where({ userId }).first()
  return rec ? { ...DEFAULT_SETTINGS, ...rec.data } : { ...DEFAULT_SETTINGS }
}

export async function saveUserSettings(userId, data) {
  const existing = await db.userSettings.where({ userId }).first()
  if (existing) await db.userSettings.update(existing.id, { data })
  else await db.userSettings.add({ userId, data })
}

export async function getMasterHistory(userId) {
  return db.masterHistory.where({ userId }).sortBy('date')
}

export async function addMasterHistoryRecord(userId, record) {
  return db.masterHistory.add({ userId, ...record })
}

export async function deleteMasterHistoryRecord(id) {
  return db.masterHistory.delete(id)
}

export async function clearMasterHistoryByUser(userId) {
  return db.masterHistory.where({ userId }).delete()
}

export async function getEasyData(userId) {
  const rec = await db.easyData.where({ userId }).first()
  return { stamps: rec?.stamps ?? {}, counts: rec?.counts ?? {} }
}

export async function saveEasyData(userId, stamps, counts) {
  const existing = await db.easyData.where({ userId }).first()
  if (existing) await db.easyData.update(existing.id, { stamps, counts })
  else await db.easyData.add({ userId, stamps, counts })
}
