import { ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React from "react";
import { PostsQuery } from "../generated/graphql";

interface UpdootSectionProps {
  post: PostsQuery["posts"][0];
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({}) => {
  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
      <IconButton
        aria-label="updoot post"
        onClick={() => console.log("hi")}
        icon="chevron-up"
      />
      {x.points}
      <ChevronDownIcon />
    </Flex>
  );
};
