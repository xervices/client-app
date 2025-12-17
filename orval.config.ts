import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      // Option 1: URL to Swagger JSON
      target: 'https://server-api-bibv.onrender.com/api/docs-json',
    },
    output: {
      mode: 'tags-split', // Creates separate files per tag
      target: './api/generated', // Output directory
      client: 'react-query', // Generate React Query hooks
      override: {
        mutator: {
          path: './api/axios-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
});
