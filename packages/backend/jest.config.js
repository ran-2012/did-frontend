/** @type {import('ts-jest').JestConfigWithTsJest} */
const encodings = require('../../node_modules/.pnpm/iconv-lite@0.6.3/node_modules/iconv-lite/encodings');
const eiconvLite = require('../../node_modules/.pnpm/iconv-lite@0.6.3/node_modules/iconv-lite/lib');
eiconvLite.getCodec('UTF-8');
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
    }
};