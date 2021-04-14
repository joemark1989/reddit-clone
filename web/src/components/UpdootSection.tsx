import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

// reason we are doing this is because we have access to Post which has points.
//For now we are just using points from post, but in the future we could use more.
interface UpdootSectionProps {
  post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    "updoot-loading" | "downdoot-loading" | "not-loading"
  >("not-loading");
  const [, vote] = useVoteMutation();
  return (
    <Flex direction="column" alignItems="center" justifyContent="center" mr={4}>
      <IconButton
        onClick={async () => {
          if (post.voteStatus === 1) return;
          setLoadingState("updoot-loading");
          await vote({
            postId: post.id,
            value: 1,
          });
          setLoadingState("not-loading");
        }}
        color={post.voteStatus === 1 ? "green" : undefined}
        isLoading={loadingState === "updoot-loading"}
        aria-label="Updoot post"
        icon={<ChevronUpIcon />}
        fontSize="24px"
      />
      {post.points}
      <IconButton
        onClick={async () => {
          if (post.voteStatus === -1) return;
          setLoadingState("downdoot-loading");
          await vote({
            postId: post.id,
            value: -1,
          });
          setLoadingState("not-loading");
        }}
        color={post.voteStatus === -1 ? "red" : undefined}
        isLoading={loadingState === "downdoot-loading"}
        aria-label="Downdoot post"
        icon={<ChevronDownIcon />}
        fontSize="24px"
      />
    </Flex>
  );
};
