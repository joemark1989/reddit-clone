import { Box } from "@chakra-ui/react";
import React from "react";
import { Layout } from "../components/Layout";
import { withApollo } from "../utils/withApollo";

export const Custom400 = ({ }) => {

    return (
        <Layout>
            <Box>404</Box>
        </Layout>
    );
};

export default withApollo({ ssr: false })(Custom400);
