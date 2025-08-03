# Task Completion Checklist

## Required Steps After Code Changes

### 1. Type Checking
```bash
pnpm type-check
```
- Must pass with no TypeScript errors
- Validates type safety across the codebase
- Required before any commit

### 2. Linting
```bash
pnpm lint
```
- Must pass with no ESLint errors
- Use `pnpm lint:fix` for auto-fixable issues
- Enforces code style consistency

### 3. Testing
```bash
pnpm test
```
- All tests must pass
- Includes unit tests and integration tests
- Use `pnpm test:coverage` to check coverage if needed

### 4. Build Verification
```bash
pnpm build
```
- Verifies the production build works
- Includes type-check and lint in the process
- Creates minified, tree-shaken output

## Important Notes
- **Order Matters**: Always run type-check → lint → test → build
- **Chrome API Testing**: Tests use jsdom environment with Chrome API mocks
- **Coverage**: Configured to exclude test files and dist/ directory
- **Integration Tests**: Located in `src/__tests__/integration*.test.ts`

## Before Committing
- Ensure all commands pass without errors
- Follow Conventional Commits format with Japanese descriptions
- Use appropriate Gitmoji prefixes for commit types
- Verify Chrome extension manifest and permissions are correct