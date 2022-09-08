import { Avatar, Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { useIsServer } from "../utils/useIServer"
import { useRouter } from "next/router";
import { useApolloClient } from "@apollo/client";

interface NavbarProps { }

export const Navbar: React.FC<NavbarProps> = ({ }) => {
  const router = useRouter();
  const [logout, { loading: logoutFetching }] = useLogoutMutation();
  const { data, loading } = useMeQuery({ skip: useIsServer() });
  const apolloClent = useApolloClient();
  let body = null;
  //data loading
  if (loading) {
    //user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
        <Button
          variant="link"
          color="black"
        >
          Login
        </Button>
        </NextLink>
        <NextLink href="register">
        <Button
          variant="link"
          color="black"
          ml={4}
        >
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
          <Button as={Link} mr={4} variant="solid" colorScheme={"teal"}>
            Create Post
          </Button>
        </NextLink>
        <Avatar mr={3} name={data.me.username}></Avatar>
        <Button
          variant="link"
          color="black"
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
    <Flex bg="white" position="sticky" top={0} zIndex={999} p={4} shadow="md">
      <Flex flex={1} m="auto" align="center" maxW={800}>
        <NextLink href="/">
          <Link>
            <Heading color={"black"}>Reddit Clone</Heading>
          </Link>
        </NextLink>
        <Box ml={"auto"}>{body}</Box>
      </Flex>
    </Flex>
  );
};
