import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { AppData, Budget, SavingsGoal, SyncMutation, Transaction } from './types'

interface BudsyncDB extends DBSchema {
  transactions: { key: string; value: Transaction }
  budgets: { key: string; value: Budget }
  goals: { key: string; value: SavingsGoal }
  syncQueue: { key: string; value: SyncMutation }
}

let dbPromise: Promise<IDBPDatabase<BudsyncDB>> | undefined

export function getDb() {
  dbPromise ??= openDB<BudsyncDB>('budsync-local', 1, {
    upgrade(db) {
      db.createObjectStore('transactions', { keyPath: 'id' })
      db.createObjectStore('budgets', { keyPath: 'id' })
      db.createObjectStore('goals', { keyPath: 'id' })
      db.createObjectStore('syncQueue', { keyPath: 'id' })
    },
  })
  return dbPromise
}

export async function readAll(): Promise<AppData> {
  const db = await getDb()
  const [transactions, budgets, goals, syncQueue] = await Promise.all([
    db.getAll('transactions'), db.getAll('budgets'), db.getAll('goals'), db.getAll('syncQueue'),
  ])
  return { transactions, budgets, goals, syncQueue }
}

export async function saveData(data: AppData) {
  const db = await getDb()
  const tx = db.transaction(['transactions', 'budgets', 'goals', 'syncQueue'], 'readwrite')
  await Promise.all([
    ...data.transactions.map((item) => tx.objectStore('transactions').put(item)),
    ...data.budgets.map((item) => tx.objectStore('budgets').put(item)),
    ...data.goals.map((item) => tx.objectStore('goals').put(item)),
    ...data.syncQueue.map((item) => tx.objectStore('syncQueue').put(item)),
  ])
  await tx.done
}

export async function upsertTransaction(transaction: Transaction) {
  const db = await getDb(); await db.put('transactions', transaction); return transaction
}

export async function enqueueMutation(mutation: SyncMutation) {
  const db = await getDb(); await db.put('syncQueue', mutation); return mutation
}

export async function updateMutation(mutation: SyncMutation) {
  const db = await getDb(); await db.put('syncQueue', mutation); return mutation
}

export async function removeMutation(id: string) {
  const db = await getDb(); await db.delete('syncQueue', id)
}

export async function clearLocalData() {
  const db = await getDb()
  await Promise.all([db.clear('transactions'), db.clear('budgets'), db.clear('goals'), db.clear('syncQueue')])
}
