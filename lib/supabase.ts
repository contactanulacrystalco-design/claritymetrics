// Temporary Supabase mock for MVP deployment.
// Replace with real Supabase client after validation.

/* eslint-disable @typescript-eslint/no-explicit-any */

const noopAsync = async (..._args: any[]) => ({ data: null, error: null });
const noopAsyncEmpty = async (..._args: any[]) => ({ data: [], error: null });
const noopAsyncNoData = async (..._args: any[]) => ({ error: null });

const queryBuilder = (..._args: any[]): any => ({
  select: (..._a: any[]) => queryBuilder(),
  eq: (..._a: any[]) => queryBuilder(),
  neq: (..._a: any[]) => queryBuilder(),
  order: (..._a: any[]) => queryBuilder(),
  limit: (..._a: any[]) => queryBuilder(),
  single: noopAsync,
  maybeSingle: noopAsync,
  then: (resolve: any) => resolve({ data: null, error: null }),
});

export const supabase = {
  from: (_table: string): any => ({
    select: (..._a: any[]) => queryBuilder(),

    insert: noopAsyncNoData,

    upsert: noopAsyncNoData,

    update: (..._a: any[]): any => ({
      eq: noopAsyncNoData,
      match: noopAsyncNoData,
    }),

    delete: (..._a: any[]): any => ({
      eq: noopAsyncNoData,
      match: noopAsyncNoData,
    }),
  }),
};
