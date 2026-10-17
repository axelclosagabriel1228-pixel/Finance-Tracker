import type { Transaction, WalletId, Budget, SavingsGoal } from './types'

export function signedAmount(transaction: Transaction, walletId?: WalletId) {
  if (transaction.kind === 'income') return transaction.amount
  if (transaction.kind === 'expense') return -transaction.amount
  return transaction.transferDirection === 'in' ? transaction.amount : -transaction.amount
}

export function walletBalance(transactions: Transaction[], walletId: WalletId) {
  return transactions.filter((t) => t.walletId === walletId)
    .reduce((total, t) => total + signedAmount(t, walletId), 0)
}

export function totalBalance(transactions: Transaction[]) {
  return transactions.filter((t) => t.kind !== 'transfer').reduce((total, t) => total + signedAmount(t), 0)
}

export function monthKey(date = new Date()) {
  return date.toISOString().slice(0, 7)
}

export function monthExpenses(transactions: Transaction[], month = monthKey()) {
  return transactions.filter((t) => t.kind === 'expense' && t.date.startsWith(month)).reduce((total, t) => total + t.amount, 0)
}

export function monthIncome(transactions: Transaction[], month = monthKey()) {
  return transactions.filter((t) => t.kind === 'income' && t.date.startsWith(month)).reduce((total, t) => total + t.amount, 0)
}

export function budgetProgress(budget: Budget | undefined, transactions: Transaction[]) {
  const spent = budget?.spent ?? monthExpenses(transactions, budget?.month)
  return { spent, amount: budget?.amount ?? 0, percentage: budget?.amount ? Math.min(100, (spent / budget.amount) * 100) : 0 }
}

export function goalProgress(goal: SavingsGoal) {
  return goal.target ? Math.min(100, (goal.saved / goal.target) * 100) : 0
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value)
}
