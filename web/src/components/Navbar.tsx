import {
  forwardRef,
  AvatarProps,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Link,
  Menu,
  MenuItem,
  MenuList,
  useColorMode,
  useColorModeValue,
  MenuButton,
  Avatar,
  ChakraComponent,
  // Avatar,
} from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { useIsServer } from "../utils/useIServer";
import { useApolloClient } from "@apollo/client";
import { ChevronDownIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";

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
