import { Heading } from "@chakra-ui/react";
import { Layout } from "../../components/Layout";
import { useIsAuth } from "../../utils/useIsAuth";
import withApollo from "../../utils/withApollo";

const CreatePost = () => {
  useIsAuth();
  return (
    <Layout variant="small">
      <Heading>Coming soon...</Heading>
    </Layout>
  );
};

export default withApollo({ ssr: false })(CreatePost);
