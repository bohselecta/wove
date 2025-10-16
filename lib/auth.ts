export async function requireUserId() {
  try {
    const { auth } = await import('@clerk/nextjs/server')
    const { userId } = await auth()
    if (!userId) throw new Error('UNAUTHORIZED')
    return userId
  } catch {
    if (!process.env.CLERK_SECRET_KEY) return 'dev-user' // local/dev bypass
    throw new Error('UNAUTHORIZED')
  }
}
