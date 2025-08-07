# Project Structure

## Root Directory Layout
```
vite-project/
├── src/                    # Source code
├── api/                    # Vercel serverless functions
├── public/                 # Static assets
├── dist/                   # Build output (generated)
├── node_modules/           # Dependencies (generated)
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── vercel.json             # Vercel deployment config
├── tsconfig.json           # TypeScript project config
├── tsconfig.app.json       # App TypeScript config
├── deploy.ps1              # PowerShell deployment script
└── DEPLOYMENT.md           # Deployment documentation
```

## Source Code Organization (`src/`)
```
src/
├── api/                    # API client and configuration
│   └── chat.ts            # Chat API client with streaming support
├── components/             # Vue components
│   ├── features/          # Feature-specific components
│   └── layout/            # Layout and UI components
├── pages/                  # Route components (file-based routing)
│   ├── (home).vue         # Home page route
│   └── chat.vue           # Chat interface route
├── stores/                 # Pinia state management
│   ├── chat.ts            # Chat state and actions
│   └── ui.ts              # UI state management
├── types/                  # TypeScript type definitions
│   └── chat.ts            # Chat-related types
├── utils/                  # Utility functions
│   ├── contentParser.ts   # Content parsing utilities
│   ├── date.ts            # Date formatting utilities
│   ├── storage.ts         # Local storage management
│   └── text.ts            # Text processing utilities
├── router/                 # Vue Router configuration
│   └── index.ts           # Router setup
├── assets/                 # Static assets
│   └── images/            # Image assets
├── App.vue                 # Root Vue component
├── main.ts                 # Application entry point
├── style.css              # Global styles and Tailwind imports
└── vite-env.d.ts          # Vite environment types
```

## API Directory (`api/`)
```
api/
└── v1/
    └── chat.js             # Vercel serverless function for chat API
```

## Key Architectural Patterns

### File-based Routing
- Routes are automatically generated from files in `src/pages/`
- `(home).vue` creates the root `/` route
- `chat.vue` creates the `/chat` route
- Uses `unplugin-vue-router` for automatic route generation

### Component Organization
- **Features**: Domain-specific components (chat interface, research tools)
- **Layout**: Reusable UI components (headers, sidebars, modals)
- Components should be single-file Vue components with TypeScript

### State Management Pattern
- **Pinia stores** for global state management
- **Composition API** pattern throughout the application
- Store files export composable functions using `defineStore`

### API Client Pattern
- Centralized API client in `src/api/chat.ts`
- Singleton pattern for API instance management
- Streaming response handling with proper error management
- Type-safe request/response interfaces

### Utility Organization
- **Domain-specific utilities**: Separate files for different concerns
- **Pure functions**: Utilities should be stateless and testable
- **TypeScript**: All utilities should be fully typed

### Type Definitions
- Centralized type definitions in `src/types/`
- Domain-specific type files (e.g., `chat.ts` for chat-related types)
- Export interfaces and types for reuse across components

## Naming Conventions
- **Files**: kebab-case for components, camelCase for utilities
- **Components**: PascalCase for component names
- **Variables**: camelCase for variables and functions
- **Constants**: UPPER_SNAKE_CASE for constants
- **Types**: PascalCase for interfaces and types

## Import Patterns
- Use relative imports for local files
- Use absolute imports from `src/` root when needed
- Group imports: external libraries first, then internal modules
- Use type-only imports when importing only types