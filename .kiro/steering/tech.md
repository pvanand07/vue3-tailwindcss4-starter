# Technology Stack

## Core Technologies
- **Frontend Framework**: Vue 3 with Composition API
- **Build Tool**: Vite 5.4+
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS
- **State Management**: Pinia
- **Routing**: Vue Router with file-based routing (unplugin-vue-router)
- **Package Manager**: pnpm (preferred)

## Key Dependencies
- **Icons**: Lucide Vue Next
- **Markdown**: Markdown-it for rich text rendering
- **Storage**: PouchDB for local data persistence
- **Utilities**: VueUse integrations, UUID generation
- **Meta Management**: Unhead for SEO and meta tags

## Development Tools
- **TypeScript Config**: Strict mode with ES2020 target
- **Linting**: Strict TypeScript rules with unused variable detection
- **Hot Reload**: Vite HMR with Vue 3 support
- **File-based Routing**: Automatic route generation from pages directory

## API Architecture
- **Development**: Vite proxy configuration forwards `/api/v1/chat` to external API
- **Production**: Vercel serverless functions in `/api/v1/` directory
- **Security**: API keys handled server-side, never exposed to client
- **Streaming**: Support for Server-Sent Events (SSE) streaming responses

## Build Commands
```bash
# Install dependencies
pnpm install

# Start development server (with API proxy)
pnpm run dev

# Build for production
pnpm run build

# Preview production build locally
pnpm run preview
```

## Deployment
- **Platform**: Vercel (primary)
- **Build Command**: `pnpm run build`
- **Output Directory**: `dist`
- **Framework**: Auto-detected as Vite
- **API Routes**: Serverless functions in `/api/v1/`
- **SPA Routing**: Configured via `vercel.json` rewrites

## Configuration Files
- `vite.config.ts`: Build configuration and dev proxy
- `vercel.json`: Production deployment and API routing
- `tsconfig.json`: TypeScript project references
- `tsconfig.app.json`: App-specific TypeScript config
- `package.json`: Dependencies and scripts

## Development Workflow
1. Use `pnpm run dev` for development with hot reload
2. API calls to `/api/v1/chat` are automatically proxied
3. TypeScript compilation happens in parallel with Vite
4. Tailwind CSS v4 processes styles via PostCSS
5. File-based routing generates routes automatically


---
description: Best practices for Vue components
globs: **/*.vue
alwaysApply: false
---

- Name files consistently using PascalCase (`UserProfile.vue`) OR kebab-case (`user-profile.vue`)
- ALWAYS use PascalCase for component names in source code
- Compose names from the most general to the most specific: `SearchButtonClear.vue` not `ClearSearchButton.vue`
- ALWAYS define props with `defineProps<{ propOne: number }>()` and TypeScript types, WITHOUT `const props =`
- Use `const props =` ONLY if props are used in the script block
- Destructure props to declare default values
- ALWAYS define emits with `const emit = defineEmits<{ eventName: [argOne: type]; otherEvent: [] }>()` for type safety
- ALWAYS use camelCase in JS for props and emits, even if they are kebab-case in templates
- ALWAYS use kebab-case in templates for props and emits
- ALWAYS use the prop shorthand if possible: `<MyComponent :count />` instead of `<MyComponent :count="count" />` (value has the same name as the prop)
- ALWAYS Use the shorthand for slots: `<template #default>` instead of `<template v-slot:default>`
- ALWAYS use explicit `<template>` tags for ALL used slots
- ALWAYS use `defineModel<type>({ required, get, set, default })` to define allowed v-model bindings in components. This avoids defining `modelValue` prop and `update:modelValue` event manually

## Examples

### defineModel()

```vue
<script setup lang="ts">
// ✅ Simple two-way binding for modelvalue
const title = defineModel<string>()

// ✅ With options and modifiers
const [title, modifiers] = defineModel<string>({
  default: 'default value',
  required: true,
  get: (value) => value.trim(), // transform value before binding
  set: (value) => {
    if (modifiers.capitalize) {
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
    return value
  },
})
</script>
```

### Multiple Models

By default `defineModel()` assumes a prop named `modelValue` but if we want to define multiple v-model bindings, we need to give them explicit names:

```vue
<script setup lang="ts">
// ✅ Multiple v-model bindings
const firstName = defineModel<string>('firstName')
const age = defineModel<number>('age')
</script>
```

They can be used in the template like this:

```html
<UserForm v-model:first-name="user.firstName" v-model:age="user.age" />
```

### Modifiers & Transformations

Native elements `v-model` has built-in modifiers like `.lazy`, `.number`, and `.trim`. We can implement similar functionality in components, fetch and read <https://vuejs.org/guide/components/v-model.md#handling-v-model-modifiers> if the user needs that.


---
description: Best practices for Vue Page components and routes
globs: pages/**/*.vue
alwaysApply: false
---

This folder contains the routes of the application using Vue Router (Nuxt uses Vue Router under the hood). The routes are defined in a file-based manner, meaning that the structure of the files and folders directly corresponds to the routes of the application.

- Fetch <https://uvr.esm.is/llms.txt> and follow links to get up to date information on topics not covered here
- AVOID files named `index.vue`, instead use a group and give them a meaningful name like `pages/(home).vue`
- ALWAYS use explicit names for route params: prefer `userId` over `id`, `postSlug` over `slug`, etc.
- Use `.` in filenames to create `/` without route nesting: `users.edit.vue` -> `/users/edit`
- Use double brackets `[[paramName]]` for optional route parameters
- Use the `+` modifier after a closing bracket `]` to make a parameter repeatable: `/posts.[[slug]]+.vue` matches `/posts/some-posts` and `/posts/some/post`
- Within a page component, use `definePage()` to customize the route's properties like `meta`, `name`, `path`, `alias`, etc
- ALWAYS refer to the `typed-router.d.ts` file to find route names and parameters
- Prefer named route locations for type safety and clarity, e.g., `router.push({ name: '/users/[userId]', params: { userId } })` rather than `router.push('/users/' + userId)`
- Pass the name of the route to `useRoute('/users/[userId]')` to get stricter types

## Example

### Basic File Structure

```
src/pages/
├── (home).vue # groups give more descriptive names to routes
├── about.vue
├── [...path].vue # Catch-all route for not found pages
├── users.edit.vue # use `.` to break out of layouts
├── users.vue # Layout for all routes in users/
└── users/
    ├── (user-list).vue
    └── [userId].vue
```

### Route groups

Route groups can also create shared layouts without interfering with the generated URL:

```
src/pages/
├── (admin).vue # layout for all admin routes, does not affect other pages
├── (admin)/
│   ├── dashboard.vue
│   └── settings.vue
└── (user)/
    ├── profile.vue
    └── order.vue
```

Resulting URLs:

- `/dashboard` -> renders `src/pages/(admin)/dashboard.vue`
- `/settings` -> renders `src/pages/(admin)/settings.vue`
- `/profile` -> renders `src/pages/(user)/profile.vue`
- `/order` -> renders `src/pages/(user)/order.vue`

Here is what you need to know about Tailwind CSS v4 (May 2025)

### I. Core Architecture & Performance

1.  **New Engine - Performance First:**
    *   V4 ships with a completely rewritten engine. Expect drastically reduced build times – typically sub-10ms for most projects, even large ones often under 100ms. This is achieved by more efficiently parsing sources and generating CSS on-demand.
2.  **CSS-First Configuration via `@theme`:**
    *   The primary configuration mechanism shifts from `tailwind.config.js` (for theme values) to your main CSS file using the `@theme` directive.
        ```css
        /* app.css */
        @import "tailwindcss";

        @theme {
          --font-sans: "Inter", system-ui, sans-serif;
          --color-brand-500: oklch(0.637 0.237 25.331); /* Example OKLCH color */
          --breakpoint-lg: 64rem;
          --spacing: 0.25rem; /* Base for numeric spacing utilities */
        }
        ```
    *   Theme values are defined as CSS custom properties (variables). Tailwind uses these to generate corresponding utility classes (e.g., `font-sans`, `bg-brand-500`, `lg:p-(--spacing-4)`) and also makes these variables globally available for use in custom CSS or arbitrary values (e.g., `var(--color-brand-500)`).
    *   The default theme is still provided but can be extended, overridden, or entirely replaced using this CSS-native approach. For instance, `--color-*: initial;` within `@theme` will remove all default color utilities, allowing a fully custom palette.
3.  **Modern CSS Baseline:**
    *   Targets **Safari 16.4+, Chrome 111+, Firefox 128+**. This is non-negotiable as v4 relies on features like `@property`, `color-mix()`, and modern cascade layers. Older browser support requires sticking to v3.4.
    *   The default color palette leverages OKLCH for more vibrant, perceptually uniform colors out-of-the-box.

### II. Build & Integration

1.  **Simplified Imports:**
    *   The `@tailwind base; @tailwind components; @tailwind utilities;` directives are deprecated. A single `@import "tailwindcss";` now handles the injection of base styles (Preflight), theme variables, and utilities into their respective cascade layers.
2.  **Modular Tooling Packages:**
    *   **CLI:** `npx @tailwindcss/cli ...` (package: `@tailwindcss/cli`)
    *   **PostCSS Plugin:** `@tailwindcss/postcss` (package: `@tailwindcss/postcss`)
    *   **Vite Plugin:** `@tailwindcss/vite` (package: `@tailwindcss/vite`) - Recommended for Vite projects due to optimized performance and DX.
3.  **Internalized Processing:**
    *   `postcss-import` and `autoprefixer` are generally no longer required as separate dependencies. Tailwind v4 handles CSS bundling and vendor prefixing (via Lightning CSS) internally.

### III. Key Migration Considerations & API Changes (v3 -> v4)

1.  **Configuration File Shift:**
    *   While `tailwind.config.js` can still be used for plugin definitions or complex setups (loaded via `@config "path/to/config.js";`), theme customization (colors, spacing, fonts, breakpoints) should primarily occur in CSS via `@theme`.
    *   The `content` array for source file scanning is still primarily configured via JS config if used, or Tailwind attempts automatic detection. Use `@source` in CSS for explicit path additions/exclusions.
2.  **Utility Deprecations & Renames:**
    *   The `npx @tailwindcss/upgrade` tool is highly recommended and automates most of this.
    *   Opacity syntax is now consistently `bg-black/50` (no more `bg-opacity-50`).
    *   Scales for `shadow`, `rounded`, and `blur` have been normalized (e.g., `shadow` -> `shadow-sm`, `shadow-sm` -> `shadow-xs`).
    *   `ring` default width is now `1px` (was `3px`); use `ring-3` for the old default.
3.  **Default Value Adjustments:**
    *   Default border color is now `currentColor`. Explicitly add color classes like `border-gray-200` if you relied on the v3 default gray.
    *   Default ring color is `currentColor` (was `blue-500`).
4.  **Selector Modifications:**
    *   `space-x-*`/`space-y-*` utilities now use `margin-bottom`/`margin-right` on `:not(:last-child)` for performance. This might affect inline elements or layouts with existing tweaked margins. Flex/grid `gap` is often a better alternative.
    *   Variant stacking order is now left-to-right (e.g., `dark:md:hover:bg-red-500`) for CSS-like consistency.
5.  **Custom Utility Definition:**
    *   `@utility` directive replaces `@layer components` or `@layer utilities` for defining custom, variant-aware utility classes. This ensures proper integration with Tailwind's engine and cascade layers.
        ```css
        @utility btn-primary {
          background-color: var(--color-brand-500);
          /* ... */
        }
        ```
    *   Functional utilities (e.g., `tab-*` matching `tab-2`, `tab-github`) are defined using `@utility` with a `--value()` function to parse arguments and match theme keys or arbitrary values.
6.  **`@apply` in Scoped Styles (Vue SFCs, Svelte, CSS Modules):**
    *   Due to isolated processing of these style blocks by build tools, theme variables, custom utilities, and variants defined in global CSS are not automatically available.
    *   Use `@reference "../path/to/your/main.css";` *inside* the scoped style block to make these available without duplicating CSS output.
    *   Alternatively, directly use CSS variables (`var(--color-brand-500)`) instead of `@apply` for better performance and simpler processing.
7.  **Prefix Syntax:**
    *   Utility prefixes are now variant-like: `tw:bg-red-500`. Theme variables in `@theme` remain unprefixed, but generated CSS variables *will* be prefixed (e.g., `--tw-color-red-500`).
8.  **Arbitrary Value Syntax for CSS Variables:**
    *   Using CSS variables in arbitrary values now uses parentheses: `bg-(--my-brand-color)` instead of `bg-[--my-brand-color]`. This resolves ambiguity with other arbitrary value types.

### IV. Advanced Capabilities & Modern CSS Integration

1.  **Enhanced Variant System:**
    *   Comprehensive support for ARIA attributes (`aria-checked:`, `aria-disabled:`). Custom `aria-*` variants can be defined.
    *   Data attribute variants (`data-[size=large]:`, `data-active:`).
    *   `:has()` pseudo-class support via `has-*` variants (e.g., `has-[:focus]:`).
    *   Child (`*`) and descendant (`**`) combinator variants (e.g., `*:p-2`, `**:data-avatar:rounded-full`).
    *   `group-*` and `peer-*` variants can now be named for more complex nesting/sibling scenarios (e.g., `group/item`, `peer-checked/opt1:`).
2.  **Container Queries:**
    *   Enabled via `@container` class on the parent.
    *   Size-based variants (`@sm:`, `@lg:`, or arbitrary `@min-[475px]:`) style children based on the container's width.
    *   Named containers (`@container/sidebar`, `@lg/sidebar:`) allow targeting specific ancestor containers.
    *   Container query length units (`cqw`, `cqi`) can be used in arbitrary values (e.g., `w-[50cqw]`).
3.  **Native CSS Features:**
    *   Tailwind v4 is built upon and encourages the use of native CSS variables, nesting (processed by Lightning CSS), `color-mix()`, `calc()`, etc.

### V. Workflow Adjustments & Deprecations

1.  **Preprocessors (Sass/Less/Stylus):**
    *   Not designed for use with Tailwind v4. Tailwind itself, with its CSS-native features and internal processing via Lightning CSS, fulfills most preprocessor roles.
2.  **`theme()` Function in CSS:**
    *   Deprecated. Use `var(--css-variable-name)` instead. For media queries where `var()` isn't supported, `theme(--breakpoint-xl)` (using the CSS variable name) can be used.
3.  **`corePlugins` in JS Config:**
    *   Disabling core plugins via JS config is no longer supported. Manage utility generation by not using unwanted classes or explicitly excluding them if necessary via `@source not inline(...)`.

Tailwind CSS v4 represents a leaner, faster, and more CSS-idiomatic approach. The upgrade tool (`npx @tailwindcss/upgrade`) is crucial for v3 projects. For new projects, understanding the CSS-first configuration and modern CSS dependencies is key.