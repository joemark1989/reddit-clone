import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React from "react";
import { Layout } from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [post, setPost] = React.useState({
    limit: 15,
    cursor: null as string | null,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables: post,
  });

  if (!fetching && !data) {
    return <div>No data to display... weird contact site admin.</div>;
  }

  return (
    <Layout>
      <Flex align="center">
        <Heading>Reddit Clone</Heading>
        <NextLink href="/create-post">
          <Button ml="auto" colorScheme="teal">
            <Link>Create Post</Link>
          </Button>
        </NextLink>
      </Flex>
      <br />
      {!data && fetching ? (
        <div>loading...</div>
      ) : (
        <Stack>
          {data!.posts.posts.map((x) => (
            <Flex p={5} key={x.id} shadow="md" borderWidth="1px">
              <Box>
                <Icon name="chevron-up"></Icon>
                <Icon></Icon>
                <Heading fontSize="xl">{x.title}</Heading>
                <Text mt={2}>{x.creator.username}</Text>
                <Text mt={4}>{x.textSnippet}</Text>
              </Box>
            </Flex>
          ))}
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
