import { vi } from 'vitest';

// requestHelper reads VITE_API_URL at module load; the setup file runs before
// any test module is imported, so stubbing here applies to all test files.
vi.stubEnv('VITE_API_URL', 'https://api.test');
