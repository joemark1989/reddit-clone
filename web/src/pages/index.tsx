import {
  ChevronDownIcon,
  ChevronUpIcon,
  DeleteIcon,
  EditIcon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React from "react";
import { Layout } from "../components/Layout";
import { UpdootSection } from "../components/UpdootSection";
import {
  useDeletePosstMutation,
  useMeQuery,
  usePostsQuery,
  useUpdatePostMutation,
} from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [post, setPost] = React.useState({
    limit: 15,
    cursor: null as string | null,
  });
  // renamed this to meData to avoid collisons
  const [{ data: meData }] = useMeQuery();
  const [{ data, fetching }] = usePostsQuery({
    variables: post,
  });
  const [, deletePost] = useDeletePosstMutation();
  const [, updatePost] = useUpdatePostMutation();

  if (!fetching && !data) {
    return <div>No data to display... weird contact site admin.</div>;
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
                    {meData?.me?.id !== x.creator.id ? null : (
                      <Box ml="auto">
                        <NextLink
                          href="/post/edit/[id]"
                          as={`/post/edit/${x.id}`}
                        >
                          <EditIcon
                            color="blue.400"
                            w={7}
                            h={7}
                            aria-label="Edit Post"
                            cursor="pointer"
                            mr={4}
                          />
                        </NextLink>
                        <DeleteIcon
                          color="red.500"
                          w={7}
                          h={7}
                          aria-label="Delete Post"
                          onClick={() => {
                            deletePost({ id: x.id });
                          }}
                          cursor="pointer"
                        />
                      </Box>
                    )}
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
