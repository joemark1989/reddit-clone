import { MyContext } from "../types";
import { MiddlewareFn } from "type-graphql";

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  console.log(context.req.session.userId);
  if (!context.req.session.userId) {
    throw new Error("not authenticated");
  }
  return next();
};
