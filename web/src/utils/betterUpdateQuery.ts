import { QueryInput, Cache } from "@urql/exchange-graphcache";

// this is really just for checking types instead of using cache.updateQuery within the Mutation obj on line 24.
export function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}
