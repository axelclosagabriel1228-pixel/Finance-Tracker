export function canAccessRecord(recordUserId: string, authenticatedUserId: string | null | undefined) {
  return Boolean(authenticatedUserId && recordUserId === authenticatedUserId)
}

export function isSafeMutationUser(recordUserId: string, authenticatedUserId: string | null | undefined) {
  return canAccessRecord(recordUserId, authenticatedUserId)
}
