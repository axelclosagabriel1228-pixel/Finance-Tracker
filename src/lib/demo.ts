import type { AppData, Budget, SavingsGoal, Transaction } from './types'

const userId = 'demo-user'
const now = new Date()
const date = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000).toISOString().slice(0, 10)

export function demoData(): AppData {
  const transactions: Transaction[] = [
    { id: 'demo-salary', userId, walletId: 'personal', kind: 'income', amount: 12000, category: 'Allowance', note: 'Demo monthly allowance', date: date(5), syncState: 'synced', createdAt: date(5) },
    { id: 'demo-food', userId, walletId: 'personal', kind: 'expense', amount: 420, category: 'Food', note: 'Demo lunch and coffee', date: date(2), syncState: 'synced', createdAt: date(2) },
    { id: 'demo-org', userId, walletId: 'organization', kind: 'income', amount: 3500, category: 'Project fund', note: 'Demo org contribution', date: date(7), syncState: 'synced', createdAt: date(7) },
    { id: 'demo-save', userId, walletId: 'savings', kind: 'income', amount: 2000, category: 'Set aside', note: 'Demo savings habit', date: date(6), syncState: 'synced', createdAt: date(6) },
    { id: 'demo-load', userId, walletId: 'ewallet', kind: 'expense', amount: 650, category: 'Subscriptions', note: 'Demo digital services', date: date(1), syncState: 'synced', createdAt: date(1) },
  ]
  const budgets: Budget[] = [{ id: 'demo-budget', userId, month: now.toISOString().slice(0, 7), amount: 8000, spent: 1070, syncState: 'synced' }]
  const goals: SavingsGoal[] = [{ id: 'demo-goal', userId, name: 'Emergency cushion', target: 20000, saved: 8000, deadline: `${now.getFullYear()}-12-31`, syncState: 'synced' }]
  return { transactions, budgets, goals, syncQueue: [] }
}
