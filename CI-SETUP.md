# Backend CI/CD Documentation

## Настройка CI

Этот проект использует GitHub Actions для автоматической проверки кода при каждом pull request в ветку `main` или `develop`.

## Что проверяется на CI?

### 1. **TypeScript Type Check** (`npm run type-check`)
   - Проверка статических типов без компиляции

### 2. **ESLint** (`npm run lint`)
   - Проверка качества кода
   - Автоматическое исправление ошибок: `npm run lint:fix`

### 3. **Prettier** (`npm run format:check`)
   - Проверка форматирования кода
   - Автоматическое форматирование: `npm run format`

### 4. **Build** (`npm run build`)
   - Компиляция TypeScript в JavaScript

### 5. **Tests** (`npm run test`)
   - Запуск unit-тестов

### 6. **Security Audit** (`npm audit`)
   - Проверка уязвимостей в зависимостях

## Локальное использование

Перед отправкой кода выполните:

```bash
cd backend

# Установка зависимостей
npm install

# Проверка типов
npm run type-check

# Линтинг с автоисправлением
npm run lint:fix

# Форматирование кода
npm run format

# Запуск тестов
npm run test

# Запуск всех проверок как на CI
npm run ci
```

## Git Hooks (Pre-commit)

Рекомендуется установить pre-commit hooks, чтобы проверки запускались автоматически перед коммитом:

```bash
npm install --save-dev husky lint-staged

npx husky install
npx husky add .husky/pre-commit "npm run lint:fix && npm run format"
```

## Конфигурационные файлы

- `.eslintrc.json` - конфигурация ESLint
- `.prettierrc.json` - конфигурация Prettier
- `.eslintignore` - файлы, игнорируемые ESLint
- `.prettierignore` - файлы, игнорируемые Prettier
- `jest.config.js` - конфигурация Jest для тестов
- `.github/workflows/backend-ci.yml` - конфигурация GitHub Actions

## Требования к МР

Все следующие проверки должны пройти:
- Type checking
- Linting
- Code formatting
- Build
- Tests
- Security audit
