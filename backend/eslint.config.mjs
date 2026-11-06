import js from '@eslint/js';
import tseslint from 'typescript-eslint';
export default tseslint.config(js.configs.recommended, ...tseslint.configs.recommended, {
  rules: { '@typescript-eslint/no-explicit-any': 'off', '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], 'no-empty': 'warn', '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }], '@typescript-eslint/no-require-imports': 'off', '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }] },
}, { ignores: ['dist', 'node_modules', 'prisma'] });
