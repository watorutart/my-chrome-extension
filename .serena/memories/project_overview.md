# Chrome Tab Auto Grouping - Project Overview

## Purpose
Chrome extension that automatically groups tabs by domain for better organization. Built as a Manifest V3 service worker extension.

## Core Functionality
- Automatically groups tabs by their domain
- Uses Chrome's tabGroups API for organization
- Consistent naming with `[Auto]` prefix for auto-generated groups
- Domain-based color assignment using hashing
- Handles tab creation, updates, and movement events

## Tech Stack
- **Language**: TypeScript (ES2022 target)
- **Build Tool**: esbuild
- **Testing**: Vitest with jsdom environment
- **Package Manager**: pnpm (v9.15.0)
- **Linting**: ESLint with TypeScript support
- **Chrome Extension**: Manifest V3 with service worker architecture

## Architecture
- **Entry Point**: `src/background.ts` - Service worker with Chrome API event listeners
- **Event Handlers**: `src/handlers/` - Modular handlers for tab lifecycle events
- **Utilities**: `src/utils/` - Domain extraction, group management, error handling
- **Types**: `src/types.ts` - TypeScript interfaces for tab and group management

## Key Features
- Manifest V3 service worker architecture
- `tabs` and `tabGroups` permissions
- Auto-generated groups with consistent naming (`[Auto]` prefix)
- Domain hash-based color assignment
- Comprehensive error handling for Chrome API operations
- URL validation before processing tabs