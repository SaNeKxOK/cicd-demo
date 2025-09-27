# React CI/CD Demo

A React + TypeScript + Vite project demonstrating CI/CD flows, pre-commit hooks, and automated deployment.

## Features

- **React 19** with TypeScript
- **Vite** for fast development and building
- **ESLint + Prettier** for code quality
- **Husky + lint-staged** for pre-commit hooks
- **Vitest + Testing Library** for testing
- **GitHub Actions** for CI/CD
- **Automated deployment** to GitHub Pages

## Quick Start

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript checks

## CI/CD Pipeline

The project includes two GitHub Actions workflows:

### CI Workflow (`.github/workflows/ci.yml`)

- Runs on push to `main`/`develop` and PRs to `main`
- Tests on Node.js 20.x and 22.x
- Runs type checking, linting, formatting checks, tests, and build
- Uploads build artifacts

### Deploy Workflow (`.github/workflows/deploy.yml`)

- Runs on push to `main`
- Builds and deploys to GitHub Pages
- Accessible at `https://[username].github.io/react-cicd-demo/`

## Pre-commit Hooks

Pre-commit hooks are configured with Husky and lint-staged:

- Auto-fixes ESLint issues
- Formats code with Prettier
- Only processes staged files for performance

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
