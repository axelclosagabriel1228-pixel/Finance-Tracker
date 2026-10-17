export const WALLET_IDS = ['personal', 'organization', 'savings', 'ewallet'] as const
export type WalletId = typeof WALLET_IDS[number]
export type TransactionKind = 'income' | 'expense' | 'transfer'
export type SyncState = 'pending' | 'synced' | 'failed'

export type Wallet = {
  id: WalletId
  name: string
  shortName: string
  description: string
  accent: string
}

export type Transaction = {
  id: string
  userId: string
  walletId: WalletId
  kind: TransactionKind
  amount: number
  category: string
  note: string
  date: string
  transferId?: string
  transferPeerWalletId?: WalletId
  transferDirection?: 'in' | 'out'
  syncState: SyncState
  syncError?: string
  createdAt: string
}

export type Budget = {
  id: string
  userId: string
  month: string
  amount: number
  spent: number
  syncState: SyncState
}

export type SavingsGoal = {
  id: string
  userId: string
  name: string
  target: number
  saved: number
  deadline: string
  syncState: SyncState
}

export type SyncMutation = {
  id: string
  entity: 'transaction' | 'budget' | 'goal'
  operation: 'upsert' | 'delete'
  payload: Transaction | Budget | SavingsGoal
  attempts: number
  state: SyncState
  lastError?: string
  updatedAt: string
}

export type AppData = {
  transactions: Transaction[]
  budgets: Budget[]
  goals: SavingsGoal[]
  syncQueue: SyncMutation[]
}

export const WALLETS: Wallet[] = [
  { id: 'personal', name: 'Personal Wallet', shortName: 'Personal', description: 'Daily essentials and flexible spending', accent: '#2e8b72' },
  { id: 'organization', name: 'Organization Wallet', shortName: 'Organization', description: 'Shared projects and campus activities', accent: '#d97757' },
  { id: 'savings', name: 'Savings Wallet', shortName: 'Savings', description: 'Future plans, protected from impulse spend', accent: '#7a6ad8' },
  { id: 'ewallet', name: 'E-Wallet', shortName: 'E-Wallet', description: 'Fast digital payments and subscriptions', accent: '#3564a8' },
]
