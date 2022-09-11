import { Avatar, Box, Button, color, Flex, Heading, IconButton, Link, useColorMode, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { useIsServer } from "../utils/useIServer"
import { useRouter } from "next/router";
import { useApolloClient } from "@apollo/client";
import { EditIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";

interface NavbarProps { }

export const Navbar: React.FC<NavbarProps> = ({ }) => {
  const { colorMode, toggleColorMode } = useColorMode()
  const router = useRouter();
  const [logout, { loading: logoutFetching }] = useLogoutMutation();
  const { data, loading } = useMeQuery({ skip: useIsServer() });
  const apolloClent = useApolloClient();
  let body = null;
  const textColor = useColorModeValue("black","white")
  const bg = useColorModeValue("white","black")


  //data loading
  if (loading) {
    //user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
        <Button
          variant="link"
          color={textColor}
        >
          Login
        </Button>
        </NextLink>
        <NextLink href="register">
        <Button
          variant="link"
          color={textColor}
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
          <Button size="sm" as={Link} mr={4} variant="solid" colorScheme={"teal"}>
            Create Post
          </Button>
        </NextLink>
        <Avatar size={{base: "sm", md:"md"}} mr={2} name={data.me.username}></Avatar>
        <Button
          variant="link"
          color={textColor}
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
    <Flex bg={bg} position="sticky" top={0} zIndex={999} p={4} shadow="md">
      <Flex flex={1} m="auto" align="center" maxW={800}>
        <NextLink href="/">
          <Link>
            <Heading size={"lg"} color={textColor}>Reddit Clone</Heading>
          </Link>
        </NextLink>
        <Box ml={"auto"}>{body}</Box>
        <IconButton
          aria-label="Edit Post"
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon/>}
          ml={4}
          onClick={toggleColorMode}
        />
      </Flex>
    </Flex>
  );
};
