# Contributing Examples to TanStack Carbon

Thank you for your interest in contributing examples to the TanStack Carbon
repository! This guide will help you add new examples that demonstrate TanStack
Table features with Carbon Design System components.

## 📋 Prerequisites

Before contributing, ensure you have:

- Node.js (v18 or higher)
- Yarn package manager
- Basic knowledge of React or Web Components
- Familiarity with TanStack Table and Carbon Design System

## 🎯 What Makes a Good Example?

A good example should:

- Use **Carbon Design System components** for UI
- Be **self-contained** and easy to understand
- Include **clear, commented code**
- Work in both CodeSandbox and StackBlitz

## 🚀 Getting Started

### 1. Choose Your Framework

We accept examples for:

- **React** (`/react` directory)
- **Web Components** (`/web-components` directory)

### 2. Example Structure

Each example should follow this structure:

```
your-example-name/
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript config
├── tsconfig.app.json     # App-specific TS config
├── tsconfig.node.json    # Node-specific TS config
├── index.html            # Entry HTML file
├── README.md             # Example description
├── public/
│   └── vite.svg
└── src/
    ├── main.tsx          # App entry point
    ├── index.scss        # Global styles
    └── Example/
        ├── Example.tsx       # Main example component
        ├── YourFeature.tsx   # Feature implementation
        ├── makeData.ts       # Sample data generator
        ├── example.scss      # Example-specific styles
        └── index.ts          # Exports
```

### 3. Use an Existing Example as Template

The easiest way to start is to copy an existing example:

```bash
# For React examples
cp -r react/sortable react/your-example-name

# For Web Components examples
cp -r web-components/sortable web-components/your-example-name
```

### 4. Code Guidelines

- **Use TypeScript** for type safety
- **Follow Carbon Design System patterns** for UI components
- **Keep examples focused** on one main feature
- **Add comments** to explain complex logic
- **Use meaningful variable names**
- **Include sample data** via `makeData.ts` or similar

### 5. Testing Your Example

Before submitting, test your example:

```bash
cd react/your-example-name  # or web-components/your-example-name
yarn install
yarn dev
```

Verify that:

- ✅ The example runs without errors
- ✅ All features work as expected
- ✅ The UI is responsive
- ✅ Code is properly formatted

## 📝 Submitting Your Example

### 1. Update the README

Add your example to the appropriate README:

- For React: Update `/react/README.md`
- For Web Components: Update `/web-components/README.md`

Add a new row under the **"More Examples (Community Contributed)"** section:
(Add this heading if not present)

```markdown
## More Examples (Community Contributed)

| Example           | Code sandbox                                                                                                           | Stackblitz                                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Your Example Name | [View example](https://codesandbox.io/s/github/carbon-design-system/tanstack-carbon/tree/main/react/your-example-name) | [View example](https://stackblitz.com/github/carbon-design-system/tanstack-carbon/tree/main/react/your-example-name) |
```

### 2. Create a Pull Request

1. Fork the repository
2. Create a new branch: `git checkout -b add-example-your-feature`
3. Commit your changes: `git commit -m "Add example: Your Feature Name"`
4. Push to your fork: `git push origin add-example-your-feature`
5. Open a Pull Request with:
   - **Clear title**: "Add example: Your Feature Name"
   - **Description** of what the example demonstrates
   - **Screenshots** or GIFs showing the example in action

Thank you for contributing to TanStack Carbon! Your examples help developers
learn and build better data tables. 🎉
