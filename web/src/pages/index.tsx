import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React from "react";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";
import { Layout } from "../components/Layout";
import { UpdootSection } from "../components/UpdootSection";
import { usePostsQuery, useUpdatePostMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [post, setPost] = React.useState({
    limit: 15,
    cursor: null as string | null,
  });
  const [{ data, error, fetching }] = usePostsQuery({
    variables: post,
  });
  const [, updatePost] = useUpdatePostMutation();

  if (!fetching && !data) {
    return <div>{error?.message}</div>;
  }

  return (
    <Layout>
      {!data && fetching ? (
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
              setPost({
                limit: post.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
            isLoading={fetching}
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

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
