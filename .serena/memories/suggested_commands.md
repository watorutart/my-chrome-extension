# Essential Development Commands

## Build and Development
- `pnpm dev` - Development build with watch mode and sourcemap
- `pnpm build` - Production build (includes type-check, lint, minify, tree-shake, copy files)
- `pnpm build:dev` - Development build with sourcemap and copy files
- `pnpm copy:files` - Copy manifest.json and icons to dist/
- `pnpm clean` - Clean dist/ directory using scripts/clean.js
- `pnpm package` - Build and create chrome-tab-auto-grouping.zip for distribution

## Testing
- `pnpm test` - Run all tests with Vitest
- `pnpm test:ui` - Run tests with UI interface
- `pnpm test:coverage` - Generate test coverage report

## Code Quality
- `pnpm lint` - Lint TypeScript files in src/
- `pnpm lint:fix` - Automatically fix linting errors
- `pnpm type-check` - Run TypeScript type checking without emitting files

## Task Completion Commands
When completing a task, always run in this order:
1. `pnpm type-check` - Ensure no TypeScript errors
2. `pnpm lint` - Ensure code follows style guidelines
3. `pnpm test` - Verify all tests pass

## System Commands (Darwin/macOS)
- `git status` - Check git repository status
- `ls -la` - List files with detailed information
- `find . -name "*.ts"` - Find TypeScript files
- `grep -r "pattern" src/` - Search for patterns in source code