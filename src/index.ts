import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HellResolver } from "./resolvers/hello";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  const app = express();
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HellResolver],
      validate: false,
    }),
  });
  app.get("/", (_, res) => {
    res.send("hello");
  });
  apolloServer.applyMiddleware({ app });
  app.listen(3000, () => {
    console.log("server started on port 3000");
  });
};
main();

// test code from earlier
// const post = orm.em.create(Post, { title: "my first post" });
// await orm.em.persistAndFlush(post);
// const posts = await orm.em.find(Post, {});
// console.log(posts);
