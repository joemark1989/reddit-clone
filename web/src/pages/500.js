import { Box } from "@chakra-ui/react";
import React from "react";
import { Layout } from "../components/Layout";
import withApollo  from "../utils/withApollo";

export const Custom500 = ({ }) => {

    return (
        <Layout>
            <Box>500</Box>
        </Layout>
    );
};

export default withApollo({ ssr: false })(Custom500);
