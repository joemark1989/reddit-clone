import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
} from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { useRouter } from "next/router";
import { useApolloClient } from "@apollo/client";

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
  const router = useRouter();
  const [logout, { loading: logoutFetching }] = useLogoutMutation();
  const { data, loading } = useMeQuery({ skip: isServer() });
  const apolloClent = useApolloClient();
  let body = null;
  //data loading
  if (loading) {
    //user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Button as={Link} mr={4} variant="solid" backgroundColor="blue.400">
            Login
          </Button>
        </NextLink>
        <NextLink href="register">
          <Button as={Link} mr={4} variant="solid" backgroundColor="green.300">
            Register
          </Button>
        </NextLink>
      </>
    );
    //user is logged in.
  } else {
    body = (
      <Flex align="center">
        <NextLink href="/create-post">
          <Button as={Link} mr={4} variant="solid" backgroundColor="green.300">
            Create Post
          </Button>
        </NextLink>
        <Stack direction="row">
          <Avatar name={data.me.username} mr={3}></Avatar>
        </Stack>
        <Button
          variant="solid"
          backgroundColor="red.300"
          onClick={async () => {
            await logout();
            await apolloClent.resetStore();
          }}
          isLoading={logoutFetching}
        >
          Logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex
      background="gray.200"
      position="sticky"
      top={0}
      zIndex={999}
      p={4}
      boxShadow="xl"
    >
      <Flex flex={1} m="auto" align="center" maxW={800}>
        <NextLink href="/">
          <Link>
            <Heading>Reddit Clone</Heading>
          </Link>
        </NextLink>
        <Box ml={"auto"}>{body}</Box>
      </Flex>
    </Flex>
  );
};
