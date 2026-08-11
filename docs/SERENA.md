# Serena - Semantic Code Editing Toolkit

**Serena** is a powerful coding agent toolkit that provides IDE-like semantic code retrieval and editing capabilities via MCP (Model Context Protocol). It uses Language Server Protocol (LSP) to understand code structure and enable precise, symbol-level operations.

## Overview

Serena provides:

1. **Semantic Symbol Operations** - Find, read, and manipulate code symbols (classes, functions, methods)
2. **Symbol-Based Editing** - Replace entire symbol bodies, rename across codebase
3. **Reference Analysis** - Find all references to symbols for impact analysis
4. **File Operations** - Read, write, search files with advanced filtering
5. **LSP Integration** - Direct language server protocol operations
6. **Project Management** - Multi-project support with indexing
7. **Memory System** - Persistent context across sessions

## When to Use Serena

Use Serena's semantic tools when:

- **Finding symbols** - Locate classes, functions, methods by name path
- **Editing code** - Replace entire function/method bodies precisely
- **Renaming symbols** - Rename across entire codebase with LSP support
- **Impact analysis** - Find all references to a symbol before modifying
- **Understanding structure** - Get symbol overviews without reading full files
- **Inserting code** - Add code before/after specific symbols

## When NOT to Use Serena

- **Quick text searches** - Use grepai for semantic search or Grep for exact text
- **Multi-line edits within functions** - Use Edit tool for small changes
- **File path searches** - Use Glob for file patterns
- **Exploratory searches** - Use grepai for intent-based discovery

## MCP Tools Reference

### Symbol Discovery

```typescript
mcp__plugin_serena_serena__find_symbol
// Find symbols by name path pattern

mcp__plugin_serena_serena__get_symbols_overview
// Get high-level file structure without reading full implementation

mcp__plugin_serena_serena__find_referencing_symbols
// Find all references to a symbol for impact analysis
```

### Symbol Editing

```typescript
mcp__plugin_serena_serena__replace_symbol_body
// Replace entire definition of a symbol

mcp__plugin_serena_serena__rename_symbol
// Rename symbol across entire codebase with LSP

mcp__plugin_serena_serena__insert_after_symbol
// Insert code after a symbol

mcp__plugin_serena_serena__insert_before_symbol
// Insert code before a symbol
```

### File Operations

```typescript
mcp__plugin_serena_serena__read_file
// Read file or file chunk with line ranges

mcp__plugin_serena_serena__create_text_file
// Create new file or overwrite existing

mcp__plugin_serena_serena__list_dir
// List directory contents (recursive optional)

mcp__plugin_serena_serena__find_file
// Find files by name mask (wildcards supported)

mcp__plugin_serena_serena__search_for_pattern
// Search for regex pattern in files

mcp__plugin_serena_serena__replace_content
// Regex or literal find/replace in files
```

### Project Management

```typescript
mcp__plugin_serena_serena__activate_project
// Activate project by name or path

mcp__plugin_serena_serena__execute_shell_command
// Run shell commands safely

mcp__plugin_serena_serena__get_current_config
// Get active configuration and context
```

### Memory System

```typescript
mcp__plugin_serena_serena__write_memory
// Write project memory for persistence

mcp__plugin_serena_serena__read_memory
// Read project memory

mcp__plugin_serena_serena__list_memories
// List all available memories

mcp__plugin_serena_serena__edit_memory
// Edit existing memory content

mcp__plugin_serena_serena__delete_memory
// Delete a memory
```

### Configuration & Reflection

```typescript
mcp__plugin_serena_serena__switch_modes
// Switch operational modes dynamically

mcp__plugin_serena_serena__check_onboarding_performed
// Check if project onboarding was done

mcp__plugin_serena_serena__onboarding
// Perform project onboarding

// Reflection tools (for agent self-awareness)
mcp__plugin_serena_serena__think_about_collected_information
mcp__plugin_serena_serena__think_about_task_adherence
mcp__plugin_serena_serena__think_about_whether_you_are_done
mcp__plugin_serena_serena__prepare_for_new_conversation
mcp__plugin_serena_serena__initial_instructions
```

## Symbol Operations

### Find Symbols

Find symbols using name path patterns:

```python
# Find all methods named 'calculate'
find_symbol(name_path="calculate")

# Find class method with path restriction
find_symbol(
    name_path="UserService/authenticate",
    relative_path="src/services",
    include_body=True
)

# Find all class definitions (kind 5)
find_symbol(
    name_path="",
    include_kinds=[5],
    depth=1  # Include methods/attributes
)

# Search with substring matching
find_symbol(
    name_path="handler",
    substring_matching=True,
    relative_path="src/api",
    exclude_kinds=[13]  # Exclude variables
)
```

**Response:**

```json
[
  {
    "name_path": "UserService/authenticate",
    "kind": 6,
    "relative_path": "src/services/user_service.ts",
    "body_location": {"start_line": 45, "end_line": 67},
    "body": "authenticate(username: string, password: string): boolean { ... }"
  }
]
```

### Name Path Patterns

- **Simple name**: `"calculate"` - Matches any symbol with that name
- **Relative path**: `"MyClass/myMethod"` - Matches name path suffix
- **Absolute path**: `"/MyClass/myMethod"` - Exact match within file
- **Overloaded**: `"MyClass/myMethod[0]"` - Specific overload (0-based index)

### Symbol Kinds (LSP)

```
1 = File          7 = Struct        13 = Variable
2 = Module        8 = Event         14 = Constant
3 = Namespace     9 = Operator      15 = String
4 = Package      10 = TypeParameter 16 = Number
5 = Class        11 = Property      17 = Boolean
6 = Method       12 = Function      18 = Array
```

**Common kinds for TypeScript/JavaScript:**

- `5` = Class
- `6` = Method
- `12` = Function
- `13` = Variable/Const
- `2` = Module

### Get Symbol Overview

Get high-level file structure without reading full implementation:

```python
get_symbols_overview(
    relative_path="src/lib/converters/math/percentage.ts",
    depth=0  # 0 = top-level only, 1 = include children
)
```

**Response:**

```json
[
  {
    "name_path": "calculatePercentage",
    "kind": 12,
    "relative_path": "src/lib/converters/math/percentage.ts",
    "body_location": {"start_line": 10, "end_line": 25},
    "children_count": 0
  }
]
```

### Find References

Find all references to a symbol before modifying:

```python
find_referencing_symbols(
    relative_path="src/lib/converters/math/percentage.ts",
    name_path="calculatePercentage",
    include_kinds=[6, 12],  # Methods and functions only
    include_body=False  # True to include full symbol bodies
)
```

**Response:**

```json
[
  {
    "symbol": {
      "name_path": "PercentageCalculator/calculate",
      "kind": 6,
      "relative_path": "src/components/converter/percentage-calculator.tsx",
      "body_location": {"start_line": 40, "end_line": 55}
    },
    "line": 45,
    "character": 20
  }
]
```

## Symbol-Based Editing

### Replace Symbol Body

Replace entire function/method/class body:

```typescript
// CRITICAL: Always check references first!
find_referencing_symbols(
    relative_path="src/lib/converters/math/percentage.ts",
    name_path="calculatePercentage"
)

// Then replace
replace_symbol_body(
    relative_path="src/lib/converters/math/percentage.ts",
    name_path="calculatePercentage",
    new_body=`export function calculatePercentage(value: number, total: number): number {
  if (total === 0) {
    throw new Error('Total cannot be zero');
  }
  if (!isFinite(value) || !isFinite(total)) {
    throw new Error('Values must be finite numbers');
  }
  return (value / total) * 100;
}`
)
```

**Returns:** `"OK"` on success

**CRITICAL:** Always check references before replacing to understand impact!

### Rename Symbol

Rename across entire codebase with LSP:

```python
# Rename updates ALL references automatically via LSP
rename_symbol(
    relative_path="src/lib/converters/math/percentage.ts",
    name_path="calculatePercentage",
    new_name="computePercentage"
)
```

**Returns:** `"OK"` on success

LSP ensures all imports and usages are updated correctly!

### Insert Code

Add code before or after symbols:

```typescript
// Insert after symbol (e.g., add new method to class)
insert_after_symbol(
    relative_path="src/stores/calculator-store.ts",
    name_path="CalculatorStore/reset",
    content=`
  clearHistory(): void {
    this.history = [];
  }`
)

// Insert before symbol (e.g., add import at file start)
insert_before_symbol(
    relative_path="src/lib/converters/finance/roi.ts",
    name_path="calculateROI",  // First symbol in file
    content=`import { formatCurrency } from '@/lib/utils/format';
`
)
```

**Returns:** `"OK"` on success

## File Operations

### Read Files

```python
# Read entire file
read_file(relative_path="src/lib/converters/math/percentage.ts")

# Read specific line range
read_file(
    relative_path="src/app/[locale]/math/percentage/page.tsx",
    start_line=50,  # 0-based index
    end_line=100
)

# Read with size limits (prevent token overflow)
read_file(
    relative_path="src/components/converter/advanced-calculator.tsx",
    max_answer_chars=20000
)
```

### Search for Patterns

```python
# Search for regex pattern
search_for_pattern(
    substring_pattern=r"useTranslations\(['\"](\w+)['\"]\)",
    relative_path="src",
    restrict_search_to_code_files=True,
    context_lines_before=2,
    context_lines_after=2
)

# Search in specific file types
search_for_pattern(
    substring_pattern=r"TODO|FIXME",
    paths_include_glob="**/*.ts",
    paths_exclude_glob="**/*.test.ts"
)
```

**Response:**

```json
{
  "src/components/calculator.tsx": [
    {
      "line_number": 42,
      "content": "  // TODO: Add error handling"
    }
  ]
}
```

### Replace Content

```python
# Literal replacement
replace_content(
    relative_path="src/lib/config.ts",
    needle="DEBUG = true",
    repl="DEBUG = false",
    mode="literal",
    replace_all=False  # False = first match only
)

# Regex replacement with backreferences
replace_content(
    relative_path="src/utils/logger.ts",
    needle=r"console\.log\((.*?)\)",
    repl=r"logger.debug($!1)",  # $!1, $!2 for groups
    mode="regex",
    replace_all=True
)
```

**Returns:** `"OK"` with replacement count

### List Directory

```python
# List directory contents
list_dir(
    relative_path="src",
    recursive=False,
    skip_ignored_files=True
)
```

**Response:**

```json
{
  "dirs": ["src/models", "src/services", "src/utils"],
  "files": ["src/index.ts", "src/main.ts", "src/config.ts"]
}
```

### Find Files

```python
# Find files by name mask
find_file(
    relative_path="src",
    file_mask="*-calculator.tsx"  # Supports * and ?
)
```

**Response:**

```json
{
  "files": [
    "src/components/percentage-calculator.tsx",
    "src/components/roi-calculator.tsx"
  ]
}
```

## Project Management

### Activate Project

```python
# Activate by path
activate_project(project="/Users/fjacquet/Projects/converty")

# Activate by registered name
activate_project(project="converty")

# Check current config
config = get_current_config()
```

### Execute Shell Commands

```python
execute_shell_command(
    command="npm run build",
    cwd="frontend",  # Optional working directory
    max_answer_chars=120000
)
```

**Response:**

```json
{
  "stdout": "...",
  "stderr": "...",
  "return_code": 0,
  "duration": 2.5
}
```

## Memory System

Persist context across sessions:

```python
# Write architectural decision
write_memory(
    name="calculator_patterns",
    content="""# Calculator Patterns

## State Management
All calculators use Zustand stores created via `createCalculatorStore`.

## URL Synchronization
State is synced to URL params for shareability.

## Translation Keys
Format: `calculators.<category>.<name>.<field>`
"""
)

# Read memory
content = read_memory(name="calculator_patterns")

# List all memories
memories = list_memories()
# Returns: ["calculator_patterns", "i18n_guidelines", ...]

# Edit memory
edit_memory(
    memory_file_name="calculator_patterns",
    needle="State Management",
    repl="State Management (Updated)",
    mode="literal"
)

# Delete memory
delete_memory(memory_file_name="old_notes")
```

## Workflow Patterns

### Before Modifying a Function

```typescript
// 1. Find the function
const symbol = find_symbol(
    name_path="calculatePercentage",
    relative_path="src/lib/converters/math",
    include_body=True
)

// 2. Check all references
const refs = find_referencing_symbols(
    relative_path="src/lib/converters/math/percentage.ts",
    name_path="calculatePercentage"
)

// 3. Analyze impact
// refs shows: 12 usages across 5 files

// 4. Make changes
replace_symbol_body(
    name_path="calculatePercentage",
    new_body="..."
)
```

### Adding a New Calculator

```typescript
// 1. Create converter logic file
create_text_file(
    relative_path="src/lib/converters/math/compound-interest.ts",
    content=`export function calculateCompoundInterest(...) { ... }`
)

// 2. Find registry file structure
get_symbols_overview(relative_path="src/lib/registry/converters.ts")

// 3. Find where to insert
find_symbol(
    name_path="converters",
    relative_path="src/lib/registry/converters.ts"
)

// 4. Insert new entry (use Edit tool for array modification)
```

### Understanding New Code Area

```typescript
// 1. Get overview first
get_symbols_overview(relative_path="src/stores/calculator-store.ts")

// 2. Find specific symbols of interest
find_symbol(
    name_path="createCalculatorStore",
    include_body=True,
    depth=1  // Include methods
)

// 3. Find usages
find_referencing_symbols(
    relative_path="src/stores/calculator-store.ts",
    name_path="createCalculatorStore"
)
```

### Refactoring with Safety

```typescript
// 1. Document current behavior in memory
write_memory(
    name="refactoring_plan",
    content="Refactoring calculatePercentage to add validation..."
)

// 2. Find all references
const refs = find_referencing_symbols(...)

// 3. Replace symbol body
replace_symbol_body(...)

// 4. Verify changes
execute_shell_command(command="npm run type-check")
execute_shell_command(command="npm test")
```

## Configuration

Serena operates in different **contexts** and **modes**.

### Contexts

- `desktop-app` - Default desktop application context
- `ide` - IDE integration (VSCode, JetBrains)
- `claude-code` - Claude Code specific (disables redundant tools)
- `chatgpt` - ChatGPT integration
- `codex` - Codex CLI integration

### Modes

- `editing` - Code modification enabled
- `interactive` - Ask for clarification when needed
- `planning` - Plan before execution
- `one-shot` - Execute without clarification
- `no-onboarding` - Skip onboarding process
- `oaicompat-agent` - OpenAI compatibility mode

### Switching Modes

```python
# Switch modes during session
switch_modes(modes=["editing", "one-shot"])
```

## Best Practices

### Symbol Operations

✅ **Always check references before modifying** - Use `find_referencing_symbols`
✅ **Use symbol operations for whole functions/classes** - Precise and LSP-aware
✅ **Get overview before deep diving** - Use `get_symbols_overview` first
✅ **Use name paths for navigation** - More reliable than line numbers
✅ **Leverage LSP for renames** - Guaranteed correctness across codebase

### Memory System

✅ **Document architectural decisions** - Persist for future sessions
✅ **Use memory for patterns** - Store common patterns and conventions
✅ **Keep memories focused** - One topic per memory
✅ **Update memories when patterns change** - Keep them current

### General

✅ **Check symbol kinds** - Filter by kind to narrow searches
✅ **Use substring matching when unsure** - Better than guessing exact names
✅ **Read initial instructions** - Call `initial_instructions()` when starting
✅ **Think about collected info** - Use reflection tools for complex tasks

### Anti-patterns

❌ **Don't modify without checking references** - You might break code
❌ **Don't use for small edits within functions** - Use Edit tool instead
❌ **Don't use for exploratory searches** - Use grepai for intent-based discovery
❌ **Don't guess name paths** - Use `find_symbol` with substring matching
❌ **Don't skip onboarding** - Let Serena learn project structure

## Troubleshooting

### Symbol Not Found

```python
# Use substring matching
find_symbol(name_path="calc", substring_matching=True)

# Or get overview first
get_symbols_overview(relative_path="src/lib/converters/math/percentage.ts")
```

### Can't Find the Right Name Path

```python
# Get overview to see structure
get_symbols_overview(relative_path="file.ts")

# Use substring matching
find_symbol(name_path="partial_name", substring_matching=True)
```

### LSP Not Responding

```python
# Check current config
config = get_current_config()

# Check onboarding status
check_onboarding_performed()

# Perform onboarding if needed
onboarding()
```

### Rename Failed

```python
# Ensure symbol exists first
find_symbol(name_path="oldName", include_body=False)

# Check references
find_referencing_symbols(name_path="oldName")

# Try again with correct name path
rename_symbol(name_path="OldClass/oldMethod", new_name="newMethod")
```

## Integration with Other Tools

### Workflow: grepai → Serena → Edit

1. **Discover** with grepai semantic search
2. **Navigate** with Serena symbol operations
3. **Modify** with Serena symbol editing or Edit tool

```typescript
// 1. Find relevant code semantically
grepai_search("calculator state management")
// → Returns: src/stores/calculator-store.ts

// 2. Get structure
get_symbols_overview(relative_path="src/stores/calculator-store.ts")

// 3. Find specific symbol
find_symbol(name_path="createCalculatorStore", include_body=True)

// 4. Check impact
find_referencing_symbols(...)

// 5. Edit
replace_symbol_body(...) // OR use Edit tool for small changes
```

## Advanced Features

### Custom Analysis Tool

Create custom tools by extending Serena:

```python
from serena.tools import Tool

class CustomAnalysisTool(Tool):
    def apply(self, relative_path: str) -> str:
        # Access project and language server
        project = self.get_active_project()
        ls = self.agent.language_server

        # Custom analysis logic
        symbols = ls.request_document_symbols(relative_path)
        return json.dumps({"analyzed": len(symbols)})

# Register tool
from serena.tools import ToolRegistry
ToolRegistry().register_tool_class(CustomAnalysisTool)
```

### Direct LSP Operations

```python
from solidlsp import SolidLanguageServer

# Access language server directly
ls = agent.language_server

# Get document symbols
symbols = ls.request_document_symbols("src/main.ts")

# Find definition
definition = ls.request_definition(
    relative_path="src/services/user.ts",
    line=42,
    character=15
)

# Find references
references = ls.request_references(
    relative_path="src/models/user.ts",
    line=10,
    character=6
)
```

## Resources

- [Serena GitHub](https://github.com/oraios/serena)
- [Configuration Guide](https://github.com/oraios/serena/blob/main/docs/02-usage/050_configuration.md)
- [MCP Integration](https://github.com/oraios/serena/blob/main/docs/02-usage/030_clients.md)
- [Custom Contexts](https://github.com/oraios/serena/blob/main/docs/02-usage/050_configuration.md#contexts)
