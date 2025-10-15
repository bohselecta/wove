import { NextResponse } from 'next/server'
import { getDB } from '../../../../lib/db'
import { randomUUID } from 'crypto'
import { requireUserId } from '@/lib/auth'

// -- Optionally connect to OpenAI or use mock --
const USE_OPENAI = !!process.env.OPENAI_API_KEY

export async function POST(req: Request) {
  try {
    const userId = await requireUserId()
    const db = await getDB()
    const body = await req.json()

    const { needText, selectedSignals = [] } = body

    if (!needText || selectedSignals.length === 0) {
      return NextResponse.json(
        { error: 'Missing needText or selectedSignals' },
        { status: 400 }
      )
    }

    // 1️⃣ Combine the inputs into a structured prompt
    const systemPrompt = `
You are the Guidance Engine for Wove — The Living Loom.
Your job is to turn civic *Needs* and *Signals* into a "Weave Plan":
a positive, actionable plan that balances Impact, Feasibility, Urgency, and Equity (IFUE).
Each plan should represent a collaborative project that a small group of citizens could realistically begin.

Output format:
{
  "title": "...",
  "summary": "...",
  "impact": 0-1,
  "feasibility": 0-1,
  "urgency": 0-1,
  "equity": 0-1
}
  `

    const signalContext = selectedSignals
      .map((s: any, i: number) => `${i + 1}. [${s.topic}] ${s.claim}`)
      .join('\n')

    const userPrompt = `
Need:
${needText}

Relevant Signals:
${signalContext}

Generate a single Weave Plan that addresses this need and leverages these signals.
Use plain, uplifting language.
`

    // 2️⃣ Use OpenAI (or mock if key missing)
    let plan
    if (USE_OPENAI) {
      try {
        const completion = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.8,
          })
        }).then((r) => r.json())

        const raw = completion.choices?.[0]?.message?.content || '{}'
        plan = JSON.parse(raw)
      } catch (err) {
        console.error('LLM error:', err)
        return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
      }
    } else {
      // Mock fallback — generates a local pseudo-plan
      plan = {
        title: 'Community Solar Startup',
        summary:
          'Neighbors collaborate to fund and install shared solar panels on public buildings, lowering costs and emissions while increasing energy independence.',
        impact: 0.85,
        feasibility: 0.75,
        urgency: 0.7,
        equity: 0.8,
      }
    }

    const { title, summary, impact, feasibility, urgency, equity } = plan

    const total = (impact + feasibility + urgency + equity) / 4

    // 3️⃣ Store the new Weave Plan in database
    await db.run(
      `insert into recipes
       (id, title, summary, p_impact, p_feasibility, p_urgency, p_equity, p_total)
       values (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        title,
        summary,
        impact,
        feasibility,
        urgency,
        equity,
        total,
      ]
    )

    if (db.close) db.close()

    // 4️⃣ Respond with the created plan
    return NextResponse.json({
      success: true,
      plan,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'unauthorized', hint: 'Sign in to continue' }, { status: 401 })
    }
    console.error('Error creating recipe:', error)
    return NextResponse.json({ error: 'Failed to create recipe' }, { status: 500 })
  }
}