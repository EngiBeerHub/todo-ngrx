# Project Structure

## Root Level Organization
```
├── src/                    # Source code
├── android/               # Android Capacitor project
├── ios/                   # iOS Capacitor project
├── www/                   # Built web assets
├── node_modules/          # Dependencies
└── config files           # TypeScript, Angular, Capacitor configs
```

## Source Code Structure (`src/`)

### Application Core (`src/app/`)
```
src/app/
├── app.ts                 # Root component
├── app.config.ts          # Application configuration & providers
├── app.routes.ts          # Route definitions
├── data-access/           # Feature-specific state management
│   ├── category/          # Category domain logic
│   │   ├── facades/       # Facade pattern for state access
│   │   └── state/         # NgRx store, actions, effects, selectors
│   └── todo/              # Todo domain logic
│       ├── facades/       # Facade pattern for state access
│       └── state/         # NgRx store, actions, effects, selectors
└── pages/                 # Route components (pages)
    ├── category-list/     # Category listing page
    └── todo-list/         # Todo listing page
```

### Shared Libraries (`src/libs/`)
```
src/libs/
├── data-access/           # Shared data access utilities
│   ├── generic-http/      # HTTP service abstractions
│   └── todo/              # Domain models and interfaces
└── ui/                    # Reusable UI components
    └── components/        # Shared component library
```

## Architecture Patterns

### State Management Layers
1. **NgRx Store** - Global application state
2. **Facades** - Abstraction layer over NgRx (in `data-access/*/facades/`)
3. **Component Stores** - Local page state using `@ngrx/signals` (e.g., `category-list-store.ts`)
4. **Components** - UI layer consuming state via facades

### Component Organization
- **Pages** (`src/app/pages/`) - Route-level components with `Page` suffix
- **UI Components** (`src/libs/ui/components/`) - Reusable components with `lib-` prefix
- **Standalone Components** - All components use Angular standalone pattern

### File Naming Conventions
- **Components**: `component-name.ts` (no `.component` suffix)
- **Pages**: `page-name.ts` with `Page` class suffix
- **Stores**: `feature-name-store.ts` for component-level stores
- **Facades**: `feature.facade.ts` in respective data-access folders
- **State Files**: Organized in `state/` folders with separate files for actions, effects, selectors

### Import/Export Patterns
- **Barrel Exports**: Use `index.ts` files for clean imports
- **Standalone Imports**: Import Ionic components individually from `@ionic/angular/standalone`
- **Facade Injection**: Use `inject()` function for dependency injection
- **Signal Usage**: Prefer signals over observables in components using `toSignal()`

### Styling Organization
- **Global Styles**: `src/global.scss` and `src/theme/variables.scss`
- **Component Styles**: Inline styles in component decorators
- **SCSS**: Use SCSS preprocessor for all styling