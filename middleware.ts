import { authMiddleware } from "@clerk/nextjs"

export default authMiddleware({
  publicRoutes: [
    '/', '/dashboard',
    '/observatory', '/commons', '/library', '/workshop', '/park', '/bank',
    // read-only APIs
    '/api/signals/top', '/api/recipes', '/api/frictions',
    '/api/common_rooms', '/api/common_rooms/(.*)/tasks',
    '/api/stories', '/api/bank/gi',
    '/api/ingest' // make public or cron-only later
  ],
})

export const config = {
  matcher: [
    // protect POST/PATCH/DELETE by default
    '/((?!_next|.*\\..*).*)',
  ],
}
