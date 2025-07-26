# Technology Stack

## Core Framework
- **Angular 19** - Main application framework with standalone components
- **Ionic 8** - Mobile UI framework with iOS styling mode
- **Capacitor 7** - Cross-platform native runtime

## State Management
- **NgRx 19** - Redux-pattern state management
  - `@ngrx/store` - Core state management
  - `@ngrx/effects` - Side effect management
  - `@ngrx/signals` - Signal-based state management
  - `@ngrx/entity` - Entity state management
  - `@ngrx/router-store` - Router state integration
  - `@ngrx/store-devtools` - Development tools

## Development Tools
- **TypeScript 5.8** - Primary language with strict mode enabled
- **Angular CLI 19** - Build system and development server
- **ESLint** - Code linting with Angular-specific rules
- **Karma + Jasmine** - Testing framework
- **SCSS** - Styling preprocessor

## Common Commands

### Development
```bash
npm start                 # Start development server
npm run ionic:serve      # Start with browser opening
npm run watch           # Build with watch mode
```

### Building
```bash
npm run build           # Production build
npm run ionic:build     # Build and sync with Capacitor
npm run sync           # Sync web assets to native projects
```

### Testing & Quality
```bash
npm test               # Run unit tests
npm run coverage       # Run tests with coverage report
npm run lint          # Run ESLint
```

### Mobile Development
```bash
npm run openios        # Open iOS project in Xcode
npx cap open android   # Open Android project in Android Studio
npx cap sync          # Sync web assets to native projects
```

## Build Configuration
- **Output Directory**: `www/` for web builds
- **Asset Handling**: Static assets in `src/assets/` with API mocks
- **Environment Files**: `src/environments/` for configuration
- **Bundle Budgets**: 2MB warning, 5MB error for initial bundle