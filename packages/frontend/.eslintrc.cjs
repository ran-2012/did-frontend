module.exports = {
    root: false,
    env: {browser: true, es2020: true},
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parser: '@typescript-eslint/parser',
    plugins: ['react-refresh'],
    rules: {
        'react-refresh/only-export-components': [
            'warn',
            {allowConstantExport: true},
        ],
        'no-unused-vars': [
            'warn',
            {"args": "none"}
        ],
        'import/order': 'warn',
        'import/no-unresolved': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
    },
}
