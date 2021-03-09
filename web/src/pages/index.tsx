import { withUrqlClient } from "next-urql";
import { Layout } from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import {
  Box,
  Heading,
  Link,
  Stack,
  Text,
  Flex,
  Button,
} from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";

const Index = () => {
  const [variables, setVariables] = React.useState({
    limit: 10,
    cursor: null as string | null,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
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
          {data!.posts.map((x) => (
            <Box p={5} key={x.id} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{x.title}</Heading>
              <Text mt={4}>{x.textSnippet}</Text>
            </Box>
          ))}
        </Stack>
      )}
      {data ? (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts[data.posts.length - 1].createdAt,
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
