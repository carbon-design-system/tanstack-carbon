# TanStack Table Carbon - Integration Guide

## Overview

This package provides a comprehensive TanStack Table integration with IBM Carbon
Design System components. It includes a reusable library and 18 comprehensive
examples demonstrating various features and use cases.

## Project Structure

```
tanstack-table-carbon/
├── src/
│   ├── lib/
│   │   └── tanstackTable/          # TanStack Table library components
│   │       ├── TanstackTable.jsx   # Main table component
│   │       ├── components/         # Table sub-components
│   │       ├── hooks/              # Custom React hooks
│   │       └── utils/              # Utility functions
│   ├── examples/                   # All example implementations
│   │   ├── basicTable.jsx
│   │   ├── columnCustomization.jsx
│   │   ├── customFilters.jsx
│   │   ├── customFiltersNoAccordion.jsx
│   │   ├── editableCells.jsx
│   │   ├── emptyState.jsx
│   │   ├── expansionRadioSticky.jsx
│   │   ├── filterPanel.jsx
│   │   ├── loadingState.jsx
│   │   ├── localizedTable.jsx
│   │   ├── mixedFilters.jsx
│   │   ├── mixTable.jsx
│   │   ├── rowExpansion.jsx
│   │   ├── serverSide.jsx
│   │   ├── serverSideColumnCustomization.jsx
│   │   ├── tableSizes.jsx
│   │   ├── themedTable.jsx
│   │   ├── virtualization.jsx
│   │   └── scss/                   # Example-specific styles
│   ├── Example.tsx                 # Main example showcase component
│   ├── Example.scss                # Example showcase styles
│   ├── main.tsx                    # Application entry point
│   └── index.scss                  # Global styles
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Key Features

### Path Aliases

The project uses TypeScript path aliases for cleaner imports:

- `@/` - Points to `src/`
- `@lib/` - Points to `src/lib/`
- `@examples/` - Points to `src/examples/`

### Examples Included

1. **Basic Table** - Simple table implementation
2. **Column Customization** - Dynamic column visibility and ordering
3. **Custom Filters** - Advanced filtering with custom components
4. **Custom Filters (No Accordion)** - Filters without accordion layout
5. **Editable Cells** - Inline editing capabilities
6. **Empty State** - Handling empty data scenarios
7. **Expansion & Radio Sticky** - Row expansion with sticky columns
8. **Filter Panel** - Side panel filtering
9. **Loading State** - Loading indicators
10. **Localized Table** - Internationalization support
11. **Mixed Filters** - Combining different filter types
12. **Mix Table** - Complex table combinations
13. **Row Expansion** - Expandable rows
14. **Server Side** - Server-side data handling
15. **Server Side Column Customization** - Server-side column management
16. **Table Sizes** - Different table size variants
17. **Themed Table** - Theme switching and customization
18. **Virtualization** - Virtual scrolling for large datasets

## Installation

```bash
# Install dependencies
npm install
```

## Running the Application

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:5173` (or the next
available port).

## Development

### Adding New Examples

1. Create a new example file in `src/examples/`
2. Import and use the TanStack Table component from `@lib/tanstackTable`
3. Add the example to the `examples` array in `src/Example.tsx`
4. The example will automatically appear in the navigation

### Modifying the Library

The TanStack Table library is located in `src/lib/tanstackTable/`. Any changes
made here will be immediately reflected in all examples.

**Important**: The internal structure of the tanstackTable folder should be
maintained as it was in the original repository.

## Dependencies

### Core Dependencies

- **React** - UI library
- **@carbon/react** - IBM Carbon Design System components
- **@tanstack/react-table** - Headless table library
- **@carbon/ibm-products** - Additional Carbon components
- **react-i18next** - Internationalization
- **date-fns** - Date utilities

### Development Dependencies

- **Vite** - Build tool and dev server
- **TypeScript** - Type checking
- **ESLint** - Code linting
- **Stylelint** - Style linting
- **Sass** - CSS preprocessing

## Configuration Files

- **vite.config.ts** - Vite configuration with path aliases and SCSS support
- **tsconfig.json** - TypeScript configuration
- **eslint.config.ts** - ESLint rules
- **.env** - Environment variables (VITE_PORT=3000)

## Import Pattern

All examples use direct imports from the local library:

```javascript
import { TanstackTable } from '@lib/tanstackTable';
```

This approach:

- Maintains consistency with tanstack-carbon patterns
- Simplifies the development workflow
- Allows for easy modifications and testing

## Styling

The application uses:

- **Carbon Design System** for component styling
- **SCSS** for custom styles
- **CSS Modules** pattern for component-specific styles

## Browser Support

The application supports all modern browsers that are compatible with:

- React 18+
- ES2020+ JavaScript features
- CSS Grid and Flexbox

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, Vite will automatically use the next available
port. Check the terminal output for the actual port.

### TypeScript Errors

Run `npm install` to ensure all type definitions are installed.

### Import Errors

Verify that path aliases are correctly configured in both `vite.config.ts` and
`tsconfig.json`.

## Migration from Original Repository

This application was migrated from `zSecure-Repo/ibm-zsecure-common-ui` with the
following changes:

1. **Library Location**: Moved from `library/src/components/tanstackTable/` to
   `src/lib/tanstackTable/`
2. **Examples Location**: Moved from `playground/src/components/tanstackTable/`
   to `src/examples/`
3. **Import Updates**: Changed from `@ibm-zsecure/commons-ui` to
   `@lib/tanstackTable`
4. **Navigation**: Implemented button-based navigation instead of tabs

The internal structure of the tanstackTable library remains unchanged to
maintain compatibility and ease of updates.

## Contributing

When contributing to this project:

1. Maintain the existing folder structure
2. Follow the established import patterns
3. Use TypeScript for new components
4. Add appropriate examples for new features
5. Update this documentation as needed

## License

[Add your license information here]

## Support

For issues or questions, please refer to the main tanstack-carbon repository
documentation.
