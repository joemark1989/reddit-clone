import { Box } from "@chakra-ui/react";
import { background } from "@chakra-ui/styled-system";
import React from "react";
import { Navbar } from "./Navbar";
import { Wrapper, WrapperVariant } from "./Wrapper";

interface LayoutProps {
  variant?: WrapperVariant;
}

export const Layout: React.FC<LayoutProps> = ({ children, variant }) => {
  return (
    <Box backgroundColor="gray.200">
      <Navbar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </Box>
  );
};
