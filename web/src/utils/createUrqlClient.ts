// import { cacheExchange, Resolver, Cache } from "@urql/exchange-graphcache";
// import Router from "next/router";
// import {
//   dedupExchange,
//   Exchange,
//   fetchExchange,
//   stringifyVariables,
// } from "urql";
// import { pipe, tap } from "wonka";
// import {
//   LoginMutation,
//   LogoutMutation,
//   MeDocument,
//   MeQuery,
//   RegisterMutation,
//   VoteMutationVariables,
// } from "../generated/graphql";
// import { betterUpdateQuery } from "./betterUpdateQuery";
// import gql from "graphql-tag";
// import { isServer } from "./isServer";

// const errorExchange: Exchange = ({ forward }) => (ops$) => {
//   return pipe(
//     forward(ops$),
//     tap(({ error }) => {
//       if (error?.message.includes("not authenticated")) {
//         Router.replace("/login");
//       }
//     })
//   );
// };

// // this simply gets the data from the cache and paginates it.

// const cursorPagination = (): Resolver => {
//   return (_parent, fieldArgs, cache, info) => {
//     const { parentKey: entityKey, fieldName } = info;
//     const allFields = cache.inspectFields(entityKey);
//     const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
//     const size = fieldInfos.length;
//     if (size === 0) {
//       return undefined;
//     }

//     const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
//     const isItInTheCache = cache.resolve(
//       cache.resolve(entityKey, fieldKey) as string,
//       "posts"
//     );
//     info.partial = !isItInTheCache;
//     let hasMore = true;
//     const results: string[] = [];
//     fieldInfos.forEach((fi) => {
//       // this is how you would select nested fields. If you do just cache.resolve(enityKey, fi.fieldKey) as any;
//       // That would work if it's a flat object. However, in our case it's a nested object.
//       const key = cache.resolve(entityKey, fi.fieldKey) as any;
//       const data = cache.resolve(key, "posts") as string[];
//       const _hasMore = cache.resolve(key, "hasMore");
//       if (!_hasMore) {
//         hasMore = _hasMore as boolean;
//       }
//       results.push(...data);
//     });
//     return {
//       __typename: "PaginatedPosts",
//       hasMore,
//       posts: results,
//     };
//   };
// };

// // resolvers:{Query:{posts:cursorPagination()}} this is called a client side resolver and will run everytime the query will run
// // and you can alter how the query looks if needed, and the name posts is what matches posts.graphql file.

// const invalidateAllPost = (cache: Cache) => {
//   const allFields = cache.inspectFields("Query");
//   const fieldInfos = allFields.filter((info) => info.fieldName === "posts");
//   fieldInfos.forEach((fi) => {
//     cache.invalidate("Query", "posts", fi.arguments || {});
//   });
// };

// export const createUrqlClient = (ssrExchange: any, ctx: any) => {
//   let cookie = "";
//   if (isServer()) {
//     cookie = ctx?.req?.headers?.cookie;
//   }
//   return {
//     url: process.env.NEXT_PUBLIC_API_URL as string,
//     fetchOptions: {
//       credentials: "include" as const,
//       headers: cookie ? { cookie } : undefined,
//     },
//     exchanges: [
//       dedupExchange,
//       cacheExchange({
//         // this is how you null an id if there is no id
//         keys: {
//           PaginatedPosts: () => null,
//         },
//         resolvers: {
//           Query: {
//             posts: cursorPagination(),
//           },
//         },
//         updates: {
//           Mutation: {
//             deletePost: (_result, args, cache, info) => {
//               cache.invalidate({
//                 __typename: "Post",
//                 id: (args as DeletePosstMutationVariables).id,
//               });
//             },
//             vote: (_result, args, cache, info) => {
//               const { postId, value } = args as VoteMutationVariables;
//               const data = cache.readFragment(
//                 gql`
//                   fragment _ on Post {
//                     id
//                     points
//                     voteStatus
//                   }
//                 `,
//                 { id: postId } as any
//               );

//               if (data) {
//                 if (data.voteStatus === value) {
//                   return;
//                 }
//                 const newPoints =
//                   (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
//                 cache.writeFragment(
//                   gql`
//                     fragment __ on Post {
//                       points
//                       voteStatus
//                     }
//                   `,
//                   { id: postId, points: newPoints, voteStatus: value } as any
//                 );
//               }
//             },
//             // we call createPost to invalidate the cache, so that way when it re-loads on the client side.
//             // New post will show up.
//             createPost: (_result, args, cache, info) => {
//               invalidateAllPost(cache);
//             },
//             logout: (_result, args, cache, info) => {
//               betterUpdateQuery<LogoutMutation, MeQuery>(
//                 cache,
//                 { query: MeDocument },
//                 _result,
//                 () => ({ me: null })
//               );
//             },
//             login: (_result, args, cache, info) => {
//               betterUpdateQuery<LoginMutation, MeQuery>(
//                 cache,
//                 { query: MeDocument },
//                 _result,
//                 (result, query) => {
//                   if (result.login.errors) {
//                     return query;
//                   } else {
//                     return {
//                       me: result.login.user,
//                     };
//                   }
//                 }
//               );
//               invalidateAllPost(cache);
//             },
//             register: (_result, args, cache, info) => {
//               betterUpdateQuery<RegisterMutation, MeQuery>(
//                 cache,
//                 { query: MeDocument },
//                 _result,
//                 (result, query) => {
//                   if (result.register.errors) {
//                     return query;
//                   } else {
//                     return {
//                       me: result.register.user,
//                     };
//                   }
//                 }
//               );
//             },
//           },
//         },
//       }),
//       errorExchange,
//       fetchExchange,
//       ssrExchange,
//     ],
//   };
// };
