# grepai - Semantic Code Search

**grepai** is a privacy-first, CLI-native tool that semantically searches your codebase using vector embeddings. It understands code meaning through natural language queries, not just exact text matches.

## Overview

grepai provides:

1. **Semantic Search** - Find code by describing what it does
2. **Call Graph Analysis** - Understand function relationships and dependencies
3. **MCP Integration** - Native tool support for AI agents
4. **Real-Time Indexing** - Background daemon watches for file changes

## Installation & Setup

```bash
# Start background indexing daemon
grepai watch --background

# Check daemon status
grepai watch --status

# View index statistics
grepai status

# Stop daemon
grepai watch --stop
```

## Semantic Search

### Basic Usage

```bash
# Search with natural language
grepai search "user authentication flow"
grepai search "error handling middleware"
grepai search "database connection pool"
grepai search "API request validation"

# Limit results (default: 10)
grepai search "state management" -n 5

# AI-optimized JSON output (saves ~80% tokens)
grepai search "payment processing" --json --compact
```

### Query Tips

✅ **Use English** - Embedding model is English-trained
✅ **Describe intent**, not implementation: "handles user login" not "func Login"
✅ **Be specific**: "JWT token validation" better than "token"
✅ **Focus on behavior**: "validates form input" not "validateForm"

❌ Don't use vague queries: "code" is worse than "authentication middleware"

### Search Result Formats

**Standard Output:**

```
Found 5 results for: "user authentication flow"

─── Result 1 (score: 0.8542) ───
File: src/lib/auth.ts:45-72

  45 │ export function validateToken(token: string) {
  46 │   // ... implementation ...
```

**JSON Output:**

```json
[
  {
    "file_path": "src/lib/auth.ts",
    "start_line": 45,
    "end_line": 72,
    "score": 0.8542,
    "content": "export function validateToken(token: string) { ... }"
  }
]
```

**Compact JSON (recommended for AI agents):**

```json
[
  {
    "file_path": "src/lib/auth.ts",
    "start_line": 45,
    "end_line": 72,
    "score": 0.8542
  }
]
```

## Call Graph Tracing

### Find Callers

Find all functions that call a specified symbol:

```bash
# Find who calls this function
grepai trace callers "validateToken" --json

# Output:
{
  "callers": [
    {
      "caller_symbol": "AuthMiddleware",
      "file_path": "src/middleware/auth.ts",
      "line_number": 25
    }
  ]
}
```

**Use cases:**

- Before modifying a function: "What will break?"
- Understanding function usage: "Where is this called?"
- Impact analysis: "How widely used is this?"

### Find Callees

Find all functions called by a specified symbol:

```bash
# Find what this function calls
grepai trace callees "processPayment" --json

# Output:
{
  "callees": [
    {
      "callee_symbol": "validateCard",
      "file_path": "src/lib/payment.ts",
      "line_number": 101
    }
  ]
}
```

**Use cases:**

- Understanding dependencies: "What does this rely on?"
- Analyzing complexity: "How many functions does this call?"
- Refactoring prep: "What needs to be available?"

### Build Call Graph

Build complete call graph with configurable depth:

```bash
# Full dependency map
grepai trace graph "AuthMiddleware" --depth 3 --json

# Output:
{
  "graph": {
    "nodes": [
      {"id": "AuthMiddleware", "label": "AuthMiddleware"},
      {"id": "validateToken", "label": "validateToken"},
      {"id": "getUserFromDB", "label": "getUserFromDB"}
    ],
    "edges": [
      {"source": "AuthMiddleware", "target": "validateToken"},
      {"source": "validateToken", "target": "getUserFromDB"}
    ]
  }
}
```

**Use cases:**

- Visualizing architecture: "How does this subsystem work?"
- Dependency analysis: "What's the full call chain?"
- Refactoring planning: "What's the blast radius?"

## MCP Server Integration

grepai is available via MCP with these tools:

```typescript
// Available MCP tools
mcp__grepai__grepai_search         // Semantic code search
mcp__grepai__grepai_trace_callers  // Find callers of a symbol
mcp__grepai__grepai_trace_callees  // Find callees of a symbol
mcp__grepai__grepai_trace_graph    // Build complete call graph
mcp__grepai__grepai_index_status   // Check index health
```

### Using MCP Tools

AI agents automatically use these tools via the MCP protocol. Examples:

```python
# Semantic search
result = mcp__grepai__grepai_search(
    query="calculator state management",
    limit=10,
    compact=True
)

# Find callers
callers = mcp__grepai__grepai_trace_callers(
    symbol="createCalculatorStore"
)

# Build call graph
graph = mcp__grepai__grepai_trace_graph(
    symbol="useTranslations",
    depth=2
)

# Check index status
status = mcp__grepai__grepai_index_status(verbose=True)
```

## Configuration

grepai is configured via `.grepai/config.yaml`:

```yaml
# Embedding provider
embedder:
  provider: ollama          # ollama | lmstudio | openai
  model: nomic-embed-text
  endpoint: http://localhost:11434
  dimensions: 768
  # api_key: sk-...         # Required for OpenAI

# Storage backend
store:
  backend: gob              # gob | postgres
  postgres:
    dsn: "postgres://user:pass@localhost:5432/grepai"

# Code chunking
chunking:
  size: 512                 # Tokens per chunk
  overlap: 50               # Overlapping tokens

# File watching
watch:
  debounce_ms: 500          # Debounce delay

# Search behavior
search:
  boost:
    enabled: true           # Path-based score boosting
    penalties:              # Reduce scores for patterns
      - pattern: "/tests/"
        factor: 0.5
      - pattern: ".test."
        factor: 0.5
    bonuses:                # Increase scores for patterns
      - pattern: "/src/"
        factor: 1.1

# Call graph tracing
trace:
  mode: fast                # fast (regex) | precise (tree-sitter)
  enabled_languages:
    - .js
    - .ts
    - .jsx
    - .tsx
    - .py
  exclude_patterns:
    - "*_test.go"
    - "*.spec.ts"

# Ignored directories
ignore:
  - .git
  - .grepai
  - node_modules
  - vendor
  - dist
```

## Practical Examples

### Before Modifying a Function

```bash
# Find all callers to assess impact
grepai trace callers "createCalculatorStore" --json

# Output shows: 45 references across 18 files
# Decision: This is widely used, be very careful!
```

### Understanding New Code Area

```bash
# Semantic search for functionality
grepai search "calculator state management" --json --compact -n 10

# Returns relevant files ranked by relevance
# Read top results to understand patterns
```

### Finding Implementation Patterns

```bash
# Discover how a feature is implemented
grepai search "i18n translation loading" --json --compact

# Shows how translations are loaded across the app
```

### Refactoring Analysis

```bash
# Complete dependency analysis
grepai trace graph "useTranslations" --depth 2 --json

# Shows full call graph to understand impact
```

### Pre-Commit Safety Check

```bash
# Before committing changes to a function
grepai trace callers "myModifiedFunction" --json

# Verify all callers still compatible
```

## Best Practices

### For AI Agents

✅ **Always use `--json --compact`** - Saves ~80% tokens
✅ **Check callers before refactoring** - Understand impact first
✅ **Use appropriate depth for call graphs** - Default depth 2 is usually enough
✅ **Limit results with `-n`** - Prevent token overflow

### For Queries

✅ **Be specific and descriptive** - Better results
✅ **Use English** - Embedding model is optimized for English
✅ **Focus on intent** - "handles payment processing" not "processPayment"
✅ **Include context** - "React component for user profile" better than "profile"

### When NOT to Use

❌ **Don't use for exact text matching** - Use Grep instead
❌ **Don't use for file path patterns** - Use Glob instead
❌ **Don't use vague queries** - Be specific for better results
❌ **Don't modify without checking callers** - Always trace first

## Troubleshooting

### Index Not Found

```bash
# Start background indexing
grepai watch --background

# Wait for initial scan to complete
# Check status
grepai watch --status
```

### Outdated Results

```bash
# Restart daemon to force re-index
grepai watch --stop
grepai watch --background
```

### No Results for Known Code

```bash
# Check what's indexed
grepai status

# Verify file isn't in ignore patterns
cat .grepai/config.yaml | grep -A 10 ignore
```

### Daemon Won't Start

```bash
# Check logs
grepai watch --status

# Try foreground mode to see errors
grepai watch
```

### Slow Searches

```bash
# Reduce chunk overlap in config
# embedder.chunking.overlap: 25

# Enable path boosting to prioritize relevant files
# search.boost.enabled: true
```

## Advanced Usage

### Custom Log Directory

```bash
grepai watch --background --log-dir /custom/path
grepai watch --status --log-dir /custom/path
grepai watch --stop --log-dir /custom/path
```

### Hybrid Search (Vector + Text)

```yaml
# In .grepai/config.yaml
search:
  hybrid:
    enabled: true
    k: 60   # RRF constant for result fusion
```

### Path Boosting

```bash
# Boost specific path in search
grepai search "user model" --path-boost "models/"
```

### Trace Modes

```bash
# Fast mode (regex-based, faster)
grepai trace callers "MyFunction" --mode fast

# Precise mode (tree-sitter AST, more accurate)
grepai trace callers "MyFunction" --mode precise
```

## Integration Examples

### CI/CD Pipeline

```bash
# One-time index and search
grepai watch &
sleep 60  # Wait for initial indexing
grepai search "security vulnerabilities" --json --compact
```

### Pre-commit Hook

```bash
# Check function usage before commit
CHANGED_FUNCS=$(git diff --name-only | xargs grep "export function")
for func in $CHANGED_FUNCS; do
    grepai trace callers "$func" --json
done
```

### IDE Integration

grepai can be integrated with IDEs via MCP. See MCP Server Integration section.

## Performance Tips

1. **Use compact JSON** - Reduces output by ~80%
2. **Limit results appropriately** - Use `-n` flag
3. **Enable path boosting** - Focus on relevant directories
4. **Adjust chunk size** - Smaller chunks = faster indexing
5. **Use fast trace mode** - Unless you need AST precision

## Resources

- [grepai GitHub](https://github.com/yoanbernabeu/grepai)
- [Configuration Reference](https://github.com/yoanbernabeu/grepai/blob/main/docs/configuration.md)
- [MCP Integration Guide](https://github.com/yoanbernabeu/grepai/blob/main/docs/mcp.md)
