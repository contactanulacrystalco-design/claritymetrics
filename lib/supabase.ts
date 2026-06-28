```ts
// Temporary Supabase mock for MVP deployment.
// Replace with real Supabase client after validation.

export const supabase = {
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({
          data: null,
          error: null,
        }),

        maybeSingle: async () => ({
          data: null,
          error: null,
        }),

        order: async () => ({
          data: [],
          error: null,
        }),
      }),
    }),

    insert: async () => ({
      error: null,
    }),
  }),
};


