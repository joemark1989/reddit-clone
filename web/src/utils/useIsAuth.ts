import router from "next/router";
import React from "react";
import { useMeQuery } from "../generated/graphql";

export const useIsAuth = () => {
  const { data, loading } = useMeQuery();
  React.useEffect(() => {
    if (!loading && !data?.me) {
      // this tells next.js where to go after a login
      router.replace("/login?next=" + router.pathname);
    }
  }, [loading, data, router]);
};
