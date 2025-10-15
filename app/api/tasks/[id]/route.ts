import { NextResponse } from 'next/server'
import { getDB } from '../../../../lib/db'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const db = await getDB()
    const body = await req.json()
    const fields = ['title', 'assignee', 'due', 'status'] as const
    const updates = []
    const values: any[] = []

    for (const f of fields) {
      if (body[f] !== undefined) {
        updates.push(`${f} = ?`)
        values.push(body[f])
      }
    }
    
    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    values.push(params.id)
    await db.run(`update tasks set ${updates.join(', ')} where id = ?`, values)

    const task = await db.get(`select * from tasks where id = ?`, [params.id])
    
    if (db.close) db.close()
    
    return NextResponse.json({ success: true, task })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
