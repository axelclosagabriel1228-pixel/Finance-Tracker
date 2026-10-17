import { enqueueMutation, getDb, readAll, removeMutation, updateMutation, upsertTransaction } from './db'
import { supabase, supabaseConfigured, syncMutation } from './supabase'
import type { Budget, SavingsGoal, SyncMutation, Transaction } from './types'

export function mutationForTransaction(transaction: Transaction, userId = transaction.userId): SyncMutation {
  return { id: transaction.id, entity: 'transaction', operation: 'upsert', payload: { ...transaction, userId }, attempts: 0, state: 'pending', updatedAt: new Date().toISOString() }
}

export function mutationForBudget(budget: Budget): SyncMutation {
  return { id: budget.id, entity: 'budget', operation: 'upsert', payload: budget, attempts: 0, state: 'pending', updatedAt: new Date().toISOString() }
}

export function mutationForGoal(goal: SavingsGoal): SyncMutation {
  return { id: goal.id, entity: 'goal', operation: 'upsert', payload: goal, attempts: 0, state: 'pending', updatedAt: new Date().toISOString() }
}

export async function saveTransactionLocally(transaction: Transaction) {
  await upsertTransaction(transaction); await enqueueMutation(mutationForTransaction(transaction)); return transaction
}

export async function saveBudgetLocally(budget: Budget) {
  const data = await readAll(); await (await getDb()).put('budgets', budget)
  await enqueueMutation(mutationForBudget(budget)); return { ...data, budgets: [budget] }
}

export async function saveGoalLocally(goal: SavingsGoal) {
  const data = await readAll(); await (await getDb()).put('goals', goal)
  await enqueueMutation(mutationForGoal(goal)); return { ...data, goals: [goal] }
}

export async function syncPending(onUpdate?: (mutation: SyncMutation) => void) {
  if (!supabaseConfigured || !supabase) return { synced: 0, failed: 0, skipped: true }
  const { syncQueue } = await readAll(); let synced = 0; let failed = 0
  for (const queued of syncQueue) {
    const next = { ...queued, attempts: queued.attempts + 1, state: 'pending' as const, updatedAt: new Date().toISOString() }
    await updateMutation(next); onUpdate?.(next)
    const { error } = await syncMutation(next)
    if (error) {
      failed += 1; const failedMutation = { ...next, state: 'failed' as const, lastError: error.message, updatedAt: new Date().toISOString() }
      await updateMutation(failedMutation); onUpdate?.(failedMutation)
    } else {
      synced += 1; await removeMutation(next.id)
      if (next.entity === 'transaction') await upsertTransaction({ ...(next.payload as Transaction), syncState: 'synced', syncError: undefined })
      onUpdate?.({ ...next, state: 'synced' })
    }
  }
  return { synced, failed, skipped: false }
}

export function startSyncListeners(onUpdate?: (mutation: SyncMutation) => void) {
  const attempt = () => { void syncPending(onUpdate) }
  window.addEventListener('online', attempt)
  const onVisible = () => { if (document.visibilityState === 'visible') attempt() }
  document.addEventListener('visibilitychange', onVisible)
  return () => { window.removeEventListener('online', attempt); document.removeEventListener('visibilitychange', onVisible) }
}
