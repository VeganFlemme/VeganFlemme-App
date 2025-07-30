module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended'
  ],
  env: {
    node: true,
    es2020: true,
    jest: true
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    'no-console': 'off', // Allow console in backend
    'no-unused-vars': 'off', // Turn off base rule
    '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    'no-undef': 'off' // TypeScript handles this
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.js']
}