import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface WeavePlanInput {
  need: string
  signals: Array<{
    id: string
    source: string
    topic: string
    claim: string
    gi: { planet: number, people: number, democracy: number, learning: number }
  }>
}

export interface WeavePlanOutput {
  title: string
  summary: string
  steps: string[]
  roles: Array<{ name: string, skills: string, access: string }>
  verification: { method: string, criteria: string }
  ifue: {
    impact: number
    feasibility: number
    urgency: number
    equity: number
  }
  risks: string[]
  mitigations: string[]
  accessibility: string[]
}

export async function createWeavePlan(input: WeavePlanInput): Promise<WeavePlanOutput> {
  const systemPrompt = `You are the Guidance Engine of Wove, a civic platform for doing measurable good. 

Your role is to transform user needs and verified signals into actionable Weave Plans ranked by IFUE:
- Impact (GI delta projection)
- Feasibility (capacity/resources) 
- Urgency (time sensitivity)
- Equity (inclusion uplift & harm checks)

Each Weave Plan must include a verification plan and assumptions.

Constitutional checks from Wove's agents:
- Do-no-harm: Ensure the plan doesn't create negative externalities
- Inclusion: Design for accessibility and diverse participation
- Consent: Respect community autonomy and choice
- Transparency: Make processes and outcomes visible

Return a JSON object with this exact structure:
{
  "title": "Clear, actionable plan name",
  "summary": "2-3 sentence description of what this plan accomplishes",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "roles": [
    {"name": "Role name", "skills": "Required skills", "access": "What they need access to"}
  ],
  "verification": {
    "method": "How we'll measure success",
    "criteria": "Specific success metrics"
  },
  "ifue": {
    "impact": 0.8,
    "feasibility": 0.7, 
    "urgency": 0.6,
    "equity": 0.9
  },
  "risks": ["Risk 1", "Risk 2"],
  "mitigations": ["How to address risk 1", "How to address risk 2"],
  "accessibility": ["Accessibility consideration 1", "Accessibility consideration 2"]
}

Score IFUE on 0.0-1.0 scale. Be realistic but optimistic.`

  const userPrompt = `Create a Weave Plan for this need:

NEED: "${input.need}"

RELEVANT SIGNALS:
${input.signals.map(s => `- ${s.source}: ${s.claim} (GI: Planet ${s.gi.planet}, People ${s.gi.people}, Democracy ${s.gi.democracy}, Learning ${s.gi.learning})`).join('\n')}

Generate a practical, community-centered plan that addresses the need using insights from the signals.`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    const parsed = JSON.parse(response) as WeavePlanOutput
    
    // Validate required fields
    if (!parsed.title || !parsed.summary || !parsed.steps || !parsed.ifue) {
      throw new Error('Invalid response structure from OpenAI')
    }

    return parsed
  } catch (error) {
    console.error('Error creating Weave Plan:', error)
    
    // Fallback plan if OpenAI fails
    return {
      title: `Address ${input.need}`,
      summary: `A community-driven approach to address the identified need through collaborative action.`,
      steps: [
        'Form a working group of community members',
        'Research best practices and local resources',
        'Develop a pilot program',
        'Implement and monitor progress',
        'Share learnings with the community'
      ],
      roles: [
        { name: 'Community Organizer', skills: 'Communication, facilitation', access: 'Community networks, meeting spaces' },
        { name: 'Research Coordinator', skills: 'Data analysis, research', access: 'Local data sources, expert networks' }
      ],
      verification: {
        method: 'Community feedback and measurable outcomes',
        criteria: 'Positive community response and demonstrable progress'
      },
      ifue: {
        impact: 0.7,
        feasibility: 0.8,
        urgency: 0.6,
        equity: 0.8
      },
      risks: ['Community resistance', 'Resource constraints'],
      mitigations: ['Engage stakeholders early', 'Seek diverse funding sources'],
      accessibility: ['Ensure multiple communication channels', 'Provide translation services if needed']
    }
  }
}
