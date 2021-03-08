import { withUrqlClient } from "next-urql";
import { Navbar } from "../components/Navbar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <>
      <Navbar />
      <br />
      {!data ? (
        <div>loading...</div>
      ) : (
        data.posts.map((x) => <div key={x.id}>{x.title}</div>)
      )}
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
