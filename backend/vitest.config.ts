import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const backendRoot = path.dirname(fileURLToPath(import.meta.url));
const sharedIndex = path.resolve(backendRoot, '../shared/index.ts');

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: [
      { find: /^@my-app\/types\/index\.js$/, replacement: sharedIndex },
      { find: /^@my-app\/types$/, replacement: sharedIndex },
    ],
  },
});
