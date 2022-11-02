import { useApolloClient } from "@apollo/client";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
  Avatar,
  AvatarProps,
  Box,
  Button,
  ChakraComponent,
  Flex,
  forwardRef,
  Heading,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { useIsServer } from "../utils/useIServer";

type SpanComponent = ChakraComponent<"span", {}>;
const CustomAvatar = forwardRef<AvatarProps, "span">((props, ref) => (
  <Avatar size={{ base: "sm", md: "md" }} mr={2} ref={ref} {...props} />
)) as SpanComponent;

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [logout, { loading: logoutFetching }] = useLogoutMutation();
  const { data, loading } = useMeQuery({ skip: useIsServer() });
  const apolloClent = useApolloClient();
  let body = null;
  const textColor = useColorModeValue("black", "white");
  const bg = useColorModeValue("white", "black");
  //data loading
  if (loading) {
    //user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Button variant="link" color={textColor}>
            Login
          </Button>
        </NextLink>
        <NextLink href="register">
          <Button variant="link" color={textColor} ml={4}>
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
          <Button
            size="sm"
            as={Link}
            mr={4}
            variant="solid"
            colorScheme={"teal"}
          >
            Create Post
          </Button>
        </NextLink>
        <Menu>
          <MenuButton>
            <Avatar
              size={{ base: "sm", md: "md" }}
              mr={2}
              name={data.me.username}
            ></Avatar>
          </MenuButton>
          <MenuList>
            <MenuItem
              onClick={async () => {
                await logout();
                await apolloClent.resetStore();
              }}
            >
              Logout
            </MenuItem>
            <MenuItem>
              <NextLink href="/profile">Profile</NextLink>
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    );
  }
  return (
    <Flex bg={bg} position="sticky" top={0} zIndex={999} p={4} shadow="md">
      <Flex flex={1} m="auto" align="center" maxW={800}>
        <NextLink href="/">
          <Link>
            <Heading size={{ base: "sm", sm: "lg" }} color={textColor}>
              Reddit Clone
            </Heading>
          </Link>
        </NextLink>
        <Box ml={"auto"}>{body}</Box>
        <IconButton
          aria-label="Edit Post"
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          ml={4}
          onClick={toggleColorMode}
        />
      </Flex>
    </Flex>
  );
};
