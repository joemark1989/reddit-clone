import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { PaginatedPosts } from "../generated/graphql";
import { NextPageContext } from "next";
import { withApollo } from "next-apollo";

const createClient = (ctx?: NextPageContext) => {
  return new ApolloClient({
    ssrMode: true,
    link: createHttpLink({
      uri: process.env.NEXT_PUBLIC_API_URL as string,
      credentials: "include",
      headers: {
        cookie:
          (typeof window === "undefined"
            ? ctx?.req?.headers.cookie
            : undefined) || "",
      },
    }),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            posts: {
              keyArgs: [],
              merge(
                existing: PaginatedPosts | undefined,
                incoming: PaginatedPosts
              ): PaginatedPosts {
                return {
                  ...incoming,
                  posts: [...(existing?.posts || []), ...incoming.posts],
                };
              },
            },
          },
        },
      },
    }),
  });
}


export default withApollo(createClient)