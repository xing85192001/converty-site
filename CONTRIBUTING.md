# Contributing to Converty

Thank you for your interest in contributing to Converty!

## Code of Conduct

Be respectful and inclusive. We welcome contributors of all backgrounds and experience levels.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/converty.git
cd converty

# Install dependencies
npm install

# Create a branch
git checkout -b feature/your-feature-name
```

## Development Workflow

### Running Locally

```bash
npm run dev  # Start at http://localhost:3000
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run type-check` | TypeScript compiler check |
| `npm run format` | Auto-format with Biome |
| `npm run check` | Lint check (read-only) |
| `npm run check:fix` | Lint and auto-fix |

### Before Committing

```bash
npm run type-check  # 0 errors
npm run check       # No issues
npm run build       # Success
```

## Detailed Guides

| Guide | Description |
|-------|-------------|
| [Calculator Guide](docs/CALCULATOR_GUIDE.md) | Step-by-step for adding calculators |
| [Code Style](docs/CODE_STYLE.md) | TypeScript, naming, linting |
| [I18N Guide](docs/I18N_GUIDE.md) | Internationalization patterns |

## Testing Checklist

Before submitting:

- [ ] Calculator produces correct results
- [ ] Edge cases handled (zero, negative, large numbers)
- [ ] Responsive on mobile and desktop
- [ ] Dark mode works
- [ ] URL parameters sync (shareable links)
- [ ] All lint checks pass
- [ ] Build succeeds

## Submitting Changes

### Commit Messages

```text
Add [calculator name] calculator

- Add calculation logic
- Create page and component
- Register in converter registry

Co-Authored-By: Your Name <your@email.com>
```

### Pull Request Process

1. Ensure all checks pass locally
2. Push your branch to your fork
3. Create a Pull Request to `main`
4. Fill out the PR template
5. Address review feedback

### What Makes a Good PR

- **Focused**: One feature or fix per PR
- **Tested**: Verified to work correctly
- **Documented**: Includes docs updates if needed
- **Clean**: No unrelated changes

## Questions?

- Open an issue for discussion
- Check existing issues and PRs

Thank you for contributing!
