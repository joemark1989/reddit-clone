import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { withApollo } from "../utils/withApollo";
import NextLink from "next/link";
import React from "react";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";
import { Layout } from "../components/Layout";
import { UpdootSection } from "../components/UpdootSection";
import { usePostsQuery } from "../generated/graphql";

const Index = () => {
  const { data, error, loading, fetchMore, variables } = usePostsQuery({
    variables: {
      limit: 15,
      cursor: null,
    },
    notifyOnNetworkStatusChange: true,
  });


  if (!loading && !data) {
    return <div>{error?.message}</div>;
  }

  return (
    <Layout>
      {!data && loading ? (
        <div>loading...</div>
      ) : (
        <Stack>
          {data!.posts.posts.map((x) =>
            !x ? null : (
              <Flex p={5} key={x.id} shadow="md" borderWidth="1px">
                <UpdootSection post={x} />
                <Box flex={1}>
                  <NextLink href="/post/[id]" as={`/post/${x.id}`}>
                    <Link>
                      <Heading fontSize="xl">{x.title}</Heading>
                    </Link>
                  </NextLink>
                  <Text mt={2}>{x.creator.username}</Text>
                  <Flex align="center">
                    <Text flex={1} mt={4}>
                      {x.textSnippet}
                    </Text>
                    <Box ml="auto">
                      <EditDeletePostButtons
                        id={x.id}
                        creatorId={x.creator.id}
                      />
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            )
          )}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex>
          <Button
            onClick={() => {
              fetchMore({
                variables: {
                  limit: variables?.limit,
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1].createdAt,
                },
                // updateQuery: (
                //   previousValue,
                //   { fetchMoreResult }
                // ): PostsQuery => {
                //   if (!fetchMoreResult) {
                //     return previousValue as PostsQuery;
                //   }
                //   return {
                //     __typename: "Query",
                //     posts: {
                //       __typename: "PaginatedPosts",
                //       hasMore: (fetchMoreResult as PostsQuery).posts.hasMore,
                //       posts: [...(previousValue as PostsQuery).posts.posts],
                //     },
                //   };
                // },
              });
            }}
            isLoading={loading}
            m="auto"
            my="8"
            colorScheme="cyan"
          >
            Load More
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Index);
