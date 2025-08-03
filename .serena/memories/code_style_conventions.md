# Code Style and Conventions

## TypeScript Configuration
- **Target**: ES2022
- **Module**: ESNext with bundler resolution
- **Strict mode**: Enabled with all strict checks
- **Unused variables/parameters**: Not allowed (enforced by both TSC and ESLint)
- **Types**: Includes chrome types and vitest/globals

## ESLint Configuration
- **Base**: eslint:recommended
- **Parser**: @typescript-eslint/parser
- **Environment**: Browser, ES2022, webextensions, node
- **Key Rules**:
  - `prefer-const`: error
  - `no-var`: error 
  - Unused variables with underscore prefix allowed (`argsIgnorePattern: "^_"`)

## Code Organization
- **File Structure**: Features organized in modules with co-located tests
- **Test Location**: `__tests__/` directories alongside source files
- **Integration Tests**: Located in `src/__tests__/`
- **Naming**: kebab-case for files, PascalCase for types/interfaces

## Documentation Standards
- **Comments**: Comprehensive JSDoc comments for interfaces and complex functions
- **Language**: Comments and documentation in Japanese
- **Interface Documentation**: Includes purpose and field descriptions

## Import/Export Patterns
- **Module Type**: ES modules (type: "module" in package.json)
- **Imports**: Named imports preferred
- **Extensions**: .ts extensions allowed in imports due to bundler resolution

## Chrome Extension Patterns
- **Error Handling**: Always use error handlers from `src/utils/error-handler.ts`
- **API Validation**: Validate tab/group state before Chrome API operations
- **Naming Convention**: Auto-generated groups use `[Auto]` prefix
- **Type Safety**: Use interfaces from `src/types.ts` for Chrome API objects