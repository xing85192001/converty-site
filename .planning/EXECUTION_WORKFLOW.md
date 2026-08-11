# GSD Execution Workflow

**Preference:** Direct Tool Usage (Serena + grepai)
**Established:** 2026-01-25 (Phase 24)
**Status:** Standard for all projects

## Execution Modes

### Direct Tools (RECOMMENDED ✓)

Use Serena and grepai directly instead of spawning executor subagents.

**Benefits:**

- **Faster execution** - No subagent spawn overhead
- **Lower context burn** - Direct tool calls more efficient than agent-to-agent communication
- **Better visibility** - User sees each step in main context
- **Easier debugging** - Direct tool results visible immediately
- **More control** - Can adjust approach mid-execution

**When to use:**

- Default for all phase execution
- Research tasks (grepai semantic search)
- Code modifications (Serena symbol operations)
- File operations (Serena read/write/replace)

**Tools available:**

**grepai (Semantic Code Search):**

- `grepai_search` - Natural language code search
- `grepai_trace_callers` - Find who calls a function
- `grepai_trace_callees` - Find what a function calls
- `grepai_trace_graph` - Build call graph

**Serena (Semantic Code Editing):**

- `find_symbol` - Find functions/classes by name
- `get_symbols_overview` - Get file structure
- `find_referencing_symbols` - Find all references
- `replace_symbol_body` - Replace entire function
- `rename_symbol` - Rename across codebase
- `replace_content` - Regex/literal text replacement
- `read_file` - Read files with line ranges
- `search_for_pattern` - Flexible pattern search

### Subagent Mode (LEGACY)

Spawn specialized subagents (gsd-executor, gsd-planner, etc.) via Task tool.

**Drawbacks:**

- Higher context usage (each agent loads full context)
- Slower (spawn overhead + agent reasoning time)
- Less visibility (user sees summary, not details)
- Harder to debug (need to check agent output files)

**When to use:**

- Only when explicitly required by orchestrator patterns
- Complex multi-step workflows requiring checkpoints
- Parallel execution of independent plans

## Standard Workflow (Direct Tools)

### Phase Execution Pattern

```markdown
For each plan in phase:

1. **Read plan file** - Understand tasks and requirements
   - Use: `read_file(.planning/phases/{phase}/{plan}-PLAN.md)`

2. **Explore codebase** - Find relevant files and symbols
   - Use: `grepai_search("intent-based query")`
   - Use: `get_symbols_overview(relative_path="file.ts")`
   - Use: `find_symbol(name_path="ClassName/methodName")`

3. **Check impact** - Understand dependencies before modifying
   - Use: `find_referencing_symbols(relative_path="...", name_path="...")`
   - Use: `grepai_trace_callers("functionName")`

4. **Implement changes** - Modify code with precision
   - Use: `replace_symbol_body()` for whole functions/classes
   - Use: `replace_content()` for small edits
   - Use: `rename_symbol()` for refactoring

5. **Verify changes** - Type check and lint
   - Use: `Bash("npm run type-check")`
   - Use: `Bash("npm run check")`

6. **Commit atomically** - One commit per task
   - Use: `Bash("git add {specific-files} && git commit -m 'type(phase-plan): task'")`

7. **Create summary** - Document what was built
   - Use: `create_text_file(.planning/phases/{phase}/{plan}-SUMMARY.md)`
```

### Research Pattern

```markdown
For research tasks:

1. **Semantic search** - Find by intent, not exact text
   - Use: `grepai_search("authentication flow")`
   - Not: `grep "login"` (too literal)

2. **Understand structure** - Get file overview
   - Use: `get_symbols_overview(relative_path="auth.ts")`
   - Shows: classes, functions, methods without full bodies

3. **Read specifics** - Get details when needed
   - Use: `find_symbol(name_path="AuthService", include_body=true)`
   - Use: `read_file()` for full file content

4. **Trace relationships** - Understand call graph
   - Use: `grepai_trace_callers("authenticate")`
   - Use: `find_referencing_symbols()`
```

### Refactoring Pattern

```markdown
For refactoring tasks:

1. **Find target** - Locate code to refactor
   - Use: `grepai_search("old pattern description")`
   - Use: `find_symbol(name_path="...")`

2. **Check impact** - Find all usages
   - Use: `find_referencing_symbols()` - ALWAYS check before modifying
   - Use: `grepai_trace_callers()` - Understand call sites

3. **Rename safely** - LSP-aware renaming
   - Use: `rename_symbol(name_path="old", new_name="new")`
   - Guaranteed correctness across codebase

4. **Replace bodies** - Modify implementations
   - Use: `replace_symbol_body()` for whole functions
   - Use: `replace_content()` for partial changes
```

## Configuration

**File:** `.planning/config.json`

```json
{
  "execution_mode": "direct_tools",  // "direct_tools" | "subagent"
  "mode": "yolo",
  "depth": "comprehensive",
  "parallelization": true
}
```

**Values:**

- `"direct_tools"` - Use Serena/grepai directly (RECOMMENDED)
- `"subagent"` - Spawn executor subagents (legacy)

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-25 | Set `execution_mode: "direct_tools"` as standard | Phase 24 execution demonstrated 3x faster execution, lower context burn, better visibility |
| 2026-01-25 | Document workflow patterns for common tasks | Standardize tool selection, improve consistency across sessions |

## Migration from Subagent Mode

**If you have existing plans using subagent mode:**

1. Keep plan structure (frontmatter, tasks, must_haves)
2. Execute tasks using direct tools instead of spawning executor
3. Create SUMMARY.md as usual
4. Commit per task as usual
5. Results identical, process more efficient

**No plan rewriting needed** - execution method is orthogonal to plan content.

---

_Established: 2026-01-25_
_Last updated: 2026-01-25_
