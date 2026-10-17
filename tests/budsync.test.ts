import { describe, expect, it } from 'vitest'
import { monthExpenses, totalBalance, walletBalance } from '../src/lib/calculations'
import { mutationForTransaction } from '../src/lib/sync'
import { canAccessRecord } from '../src/lib/security'
import type { Transaction } from '../src/lib/types'

const tx = (overrides: Partial<Transaction>): Transaction => ({
  id: 'transaction-1', userId: 'user-a', walletId: 'personal', kind: 'expense', amount: 100,
  category: 'Food', note: 'test', date: '2026-10-17', syncState: 'pending', createdAt: '2026-10-17T00:00:00.000Z', ...overrides,
})

describe('Budsync invariants', () => {
  it('keeps every new transaction pending for offline-first persistence', () => {
    const local = tx({ id: 'offline-1', syncState: 'pending' })
    expect(local.id).toBe('offline-1')
    expect(local.syncState).toBe('pending')
    expect(mutationForTransaction(local).id).toBe(local.id)
  })

  it('uses the transaction id as the idempotent sync key', () => {
    const local = tx({ id: 'same-id' })
    const first = mutationForTransaction(local)
    const replay = mutationForTransaction(local)
    expect(first.id).toBe(replay.id)
    expect(first.payload).toEqual(replay.payload)
  })

  it('moves money between wallets without changing combined balance', () => {
    const transferId = 'transfer-1'
    const before = [tx({ id: 'income', kind: 'income', amount: 1000 }), tx({ id: 'expense', kind: 'expense', amount: 200 })]
    const transfer = [
      tx({ id: 'out', kind: 'transfer', amount: 300, walletId: 'personal', transferPeerWalletId: 'savings', transferId, transferDirection: 'out' }),
      tx({ id: 'in', kind: 'transfer', amount: 300, walletId: 'savings', transferPeerWalletId: 'personal', transferId, transferDirection: 'in' }),
    ]
    expect(totalBalance([...before, ...transfer])).toBe(totalBalance(before))
    expect(walletBalance(transfer, 'personal')).toBe(-300)
    expect(walletBalance(transfer, 'savings')).toBe(300)
  })

  it('limits account access to the authenticated owner', () => {
    expect(canAccessRecord('user-a', 'user-a')).toBe(true)
    expect(canAccessRecord('user-a', 'user-b')).toBe(false)
    expect(canAccessRecord('user-a', null)).toBe(false)
  })

  it('summarizes only expenses in the selected month', () => {
    const transactions = [tx({ id: 'oct', date: '2026-10-02', amount: 100 }), tx({ id: 'sep', date: '2026-09-30', amount: 800 })]
    expect(monthExpenses(transactions, '2026-10')).toBe(100)
  })
})
