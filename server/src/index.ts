import "reflect-metadata";
import "dotenv-safe/config";
import { COOKIE_NAME, __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import { createConnection } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import path from "path";
import { Updoot } from "./entities/Updoot";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";

const main = async () => {
  // creates the connection to db
  const conn = await createConnection({
    type: "postgres",
    logging: true,
    url: process.env.DATABASE_URL,
    // synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [Post, User, Updoot],
  });

  // this runs migrations manually

  (await __prod__) ? conn.runMigrations() : null;

  // await Post.delete({});
  const app = express();
  const RedisStore = connectRedis(session);
  const redis = new Redis(process.env.REDIS_URL);
  app.set("trust proxy", 1);
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTTL: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax",
        secure: __prod__, // cookie only works in https good for prod. Maybe use ENV_VAR to turn this true / false.
        domain: __prod__ ? ".pondercode.club" : "localhost",
        // domain: __prod__ ? ".pondercode.club" : ".localhost:3000",
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      resave: false,
    })
  );
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      updootLoader: createUpdootLoader(),
    }),
  });
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });
  app.get("/", (_, res) => {
    res.send("Welcome to the server");
  });
  app.listen(+process.env.PORT, () => {
    console.log("server started on port 4000");
  });
};
main();

// test code from earlier this will insert data into the DB locally, good way to seed for now.
// const post = orm.em.create(Post, { title: "my first post" });
// await orm.em.persistAndFlush(post);
// const posts = await orm.em.find(Post, {});
// console.log(posts);
