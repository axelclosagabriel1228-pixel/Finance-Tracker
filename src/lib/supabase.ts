import { createClient } from '@supabase/supabase-js'
import type { Budget, SavingsGoal, SyncMutation, Transaction } from './types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseConfigured = Boolean(url && anonKey)
export const supabase = supabaseConfigured ? createClient(url!, anonKey!, { auth: { persistSession: true, autoRefreshToken: true } }) : null

function toCloudTransaction(item: Transaction) {
  return {
    id: item.id, user_id: item.userId, wallet_id: item.walletId, kind: item.kind, amount: item.amount,
    category: item.category, note: item.note, date: item.date, transfer_id: item.transferId ?? null,
    transfer_peer_wallet_id: item.transferPeerWalletId ?? null, created_at: item.createdAt,
  }
}
function toCloudBudget(item: Budget) {
  return { id: item.id, user_id: item.userId, month: item.month, amount: item.amount, spent: item.spent }
}
function toCloudGoal(item: SavingsGoal) {
  return { id: item.id, user_id: item.userId, name: item.name, target: item.target, saved: item.saved, deadline: item.deadline }
}

export async function syncMutation(mutation: SyncMutation) {
  if (!supabase) throw new Error('Supabase is not configured')
  if (mutation.entity === 'transaction') {
    if (mutation.operation === 'delete') return supabase.from('transactions').delete().eq('id', mutation.id)
    return supabase.from('transactions').upsert(toCloudTransaction(mutation.payload as Transaction), { onConflict: 'id' })
  }
  if (mutation.entity === 'budget') return supabase.from('budgets').upsert(toCloudBudget(mutation.payload as Budget), { onConflict: 'id' })
  return supabase.from('savings_goals').upsert(toCloudGoal(mutation.payload as SavingsGoal), { onConflict: 'id' })
}
