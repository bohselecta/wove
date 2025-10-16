import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { requireUserId } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const db = await getDB()
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const tag = searchParams.get('tag') || ''

    let sql = 'SELECT * FROM library_lessons'
    const params: any[] = []
    const conditions: string[] = []

    if (q) {
      conditions.push('(title LIKE ? OR summary LIKE ? OR content LIKE ?)')
      const searchTerm = `%${q}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    if (tag) {
      conditions.push('tags LIKE ?')
      params.push(`%${tag}%`)
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }

    sql += ' ORDER BY created_at DESC'

    const lessons = await db.all(sql, ...params)
    if (db.close) db.close()
    return NextResponse.json(lessons)
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId()
    const db = await getDB()
    const body = await request.json()
    
    const { title, summary, content, tags } = body
    
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const tagsString = Array.isArray(tags) ? tags.join(', ') : tags || ''
    
    await db.run(`
      INSERT INTO library_lessons (id, title, summary, content, tags, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, title, summary || '', content || '', tagsString, userId, new Date().toISOString()])

    if (db.close) db.close()
    return NextResponse.json({ id, title, summary, content, tags: tagsString })
  } catch (error) {
    console.error('Error creating lesson:', error)
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 })
  }
}
