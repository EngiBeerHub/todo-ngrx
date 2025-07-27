# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run watch` - Build in watch mode for development
- `npm test` - Run unit tests with Karma/Jasmine
- `npm run coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint

### Ionic/Capacitor Commands
- `npm run ionic:build` - Build and sync with Capacitor
- `npm run ionic:serve` - Start dev server with browser open
- `npm run sync` - Sync web assets to native platforms
- `npm run openios` - Open iOS project in Xcode

### Testing
- Run single test file: `ng test --include='**/specific-file.spec.ts'`
- Tests are located alongside source files (`.spec.ts` files)
- Coverage reports generated in `coverage/` directory

## Architecture Overview

### Project Structure
This is an Angular 19 + Ionic 8 todo application using NgRx for state management with a hybrid approach:

**State Management Layers:**
1. **Global NgRx Store** (`src/app/data-access/`) - Traditional NgRx with actions, reducers, effects, selectors
2. **Page-Level Signal Stores** (`src/app/pages/*/`) - NgRx Signals for local component state  
3. **Facade Layer** (`src/app/data-access/*/facades/`) - Abstracts store complexity from components

### Key Architectural Patterns

**Data Flow:**
- Components interact with Signal Stores (local state)
- Signal Stores delegate business logic to Facades  
- Facades orchestrate Global NgRx Store operations
- HTTP services handle external data via mock interceptors

**State Architecture:**
```
Component → Signal Store → Facade → NgRx Store → HTTP Service
```

**Directory Structure:**
- `src/app/data-access/` - Global NgRx state (todo, category) + facades
- `src/app/pages/` - Route components with Signal Stores
- `src/libs/data-access/` - HTTP services, adapters, models, interfaces
- `src/libs/ui/components/` - Reusable UI components

### NgRx Configuration
- **Store Setup**: Configured in `app.config.ts` with feature states
- **Features**: `todo` and `category` with separate feature keys
- **Dev Tools**: NgRx DevTools enabled for debugging
- **Router Store**: Integrated for navigation state tracking
- **Mock Data**: Uses `MockInterceptor` for development/testing

### Key Technologies
- **Angular 19** with standalone components
- **Ionic 8** in iOS mode for mobile UI
- **NgRx 19** (Store + Signals) for state management  
- **Capacitor 7** for native mobile functionality
- **TypeScript** with strict configuration
- **ESLint** for code quality

### Development Notes
- All components use standalone pattern (no NgModules)
- Signal-based reactivity with computed values and effects
- Mock API data served from `src/assets/api/` JSON files
- Japanese text in some alert messages (line 121-125 in todo-list-store.ts)
- Consistent barrel exports via `index.ts` files