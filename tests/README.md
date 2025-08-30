# Testing Structure

This project uses a streamlined testing strategy with two types of tests:

## Test Types

### Unit Tests (`tests/unit/`)
- **Framework**: Vitest with happy-dom
- **Purpose**: Test individual functions, classes, and modules in isolation
- **Run**: `npm run test:unit`
- **Watch mode**: `npm run test:unit:watch`

### UI Tests (`tests/ui/`)
- **Framework**: Playwright
- **Purpose**: End-to-end testing for user interactions, web component behavior, and visual testing
- **Run**: `npm run test:ui`
- **Headed mode**: `npm run test:ui:headed`
- **Debug mode**: `npm run test:ui:debug`

## Directory Structure

```
tests/
├── unit/           # Unit tests for individual functions/classes
├── ui/            # End-to-end UI tests and component integration
├── fixtures/      # Test data and mock objects
├── helpers/       # Shared test utilities
└── README.md      # This file
```

## Running Tests

- **All tests**: `npm test`
- **Unit tests only**: `npm run test:unit`
- **UI tests only**: `npm run test:ui`

## Test File Naming

- Unit tests: `*.test.ts`
- UI tests: `*.spec.ts`

## Helpers and Fixtures

- `tests/fixtures/sample-map-data.ts`: Mock data based on hyrule-data.json structure