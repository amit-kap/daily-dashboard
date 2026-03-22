#!/bin/bash
# Dashboard Agent — generates all data files by cross-referencing Linear, Slack, Notion, Fireflies, Calendar, Gmail
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DATA_DIR="$PROJECT_DIR/public/data"

echo "Running Dashboard Agent..."
echo "Output dir: $DATA_DIR"

# Ensure data directory exists
mkdir -p "$DATA_DIR"

# Run Claude with the dashboard agent prompt, allowing all MCP tools
claude -p "$SCRIPT_DIR/dashboard-agent-prompt.md" \
  --allowedTools "mcp__*" \
  --output-format json \
  | python3 -c "
import sys, json, re

raw = sys.stdin.read()
data = json.loads(raw)
text = data.get('result', '') if isinstance(data, dict) else str(data)

# Strategy 1: Extract JSON from markdown code blocks (\`\`\`json ... \`\`\`)
code_blocks = re.findall(r'\`\`\`(?:json)?\s*\n(.*?)\n\s*\`\`\`', text, re.DOTALL)

# Strategy 2: If no code blocks, try to find top-level JSON objects using bracket matching
if not code_blocks:
    blocks = []
    i = 0
    while i < len(text):
        if text[i] == '{':
            depth = 0
            start = i
            while i < len(text):
                if text[i] == '{': depth += 1
                elif text[i] == '}': depth -= 1
                if depth == 0:
                    blocks.append(text[start:i+1])
                    break
                i += 1
        i += 1
    code_blocks = blocks

written = set()

for block in code_blocks:
    block = block.strip()
    if not block.startswith('{'):
        continue
    try:
        parsed = json.loads(block)
    except json.JSONDecodeError:
        continue

    # Identify which file this is by its keys
    if 'recommendations' in parsed and 'recommendations.json' not in written:
        fname = 'recommendations.json'
    elif 'events' in parsed and 'calendar.json' not in written:
        fname = 'calendar.json'
    elif ('emails' in parsed or 'recentEmails' in parsed) and 'gmail.json' not in written:
        fname = 'gmail.json'
    else:
        continue

    with open(f'$DATA_DIR/{fname}', 'w') as f:
        json.dump(parsed, f, indent=2)
    print(f'Wrote {fname}')
    written.add(fname)

if not written:
    # Dump raw result for debugging
    with open(f'$DATA_DIR/.last-agent-output.txt', 'w') as f:
        f.write(text[:5000])
    print('Warning: No JSON blocks found in output', file=sys.stderr)
    print('Result preview: ' + text[:200], file=sys.stderr)
    sys.exit(1)
else:
    names = ', '.join(sorted(written))
    print('Successfully wrote ' + str(len(written)) + ' file(s): ' + names)
"

echo "Done. Data files written to $DATA_DIR"
