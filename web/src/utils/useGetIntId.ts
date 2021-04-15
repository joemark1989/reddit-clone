import { useRouter } from "next/router";

const useGetIntId = () => {
  const router = useRouter();
  const intId = typeof router.query.id === "string" ? +router.query.id : -1;
  return intId;
};

export default useGetIntId;
