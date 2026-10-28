export default defineConfig([
  { ignores: ['dist'] },
  js.configs.recommended,               
  reactHooks.configs['recommended-latest'], 
  reactRefresh.configs.vite,          
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { tsx: true } },
    },
  },
])