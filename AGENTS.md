# Wove Agents

## Ingestor
- Pulls RSS/APIs for trusted sources, de-duplicates, extracts claims, maps GI.
- Output: `signals_top` rows.

## Translator (Workshop)
- Transforms user needs into Weave Plans (see /prompts/Workshop.md).

## Guidance Engine
- Combines signals + needs → Weave Plans ranked by IFUE.
- See /prompts/GuidanceEngine.md.

## Storyteller
- Converts threads to Impact Stories (see /prompts/Story.md).

## Moderator
- Applies constitutional checks: do-no-harm, inclusion, consent, transparency.
