import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { Post } from "../entities/Post";
import { getConnection } from "typeorm";
// import { Updoot } from "../entities/Updoot";

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

// Cursor pagination vs Offset pagination
//Cursor pagination is give me all post at a certain point whereas
// offset pagination is give me X post where X can be 10.
// Notes
// When page first loads cursor will not be aval so that is why we make cursor on line 34 nullable.
// When you set something nullable you also must set the type
// orderBy('"createdAt"') this needs '' and "" because Postgres changed the A to be lowercase.
// Also you can do desc like this... orderBy('"createdAt"', "DESC")
@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const { userId } = req.session;
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    // await Updoot.insert({
    //   userId,
    //   postId,
    //   value: realValue,
    // });
    await getConnection().query(
      `
      START TRANSACTION;

      insert into updoot ("userId", "postId", value)
      values(${userId},${postId},${realValue});

      update post
      set points = points + ${realValue}
      where id = ${postId};
      
      COMMIT;
    `
    );
    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(+cursor));
    }

    // in psql there can be multiple schemas inside a db
    // in this case you may have to use public.nameOfSchemaVariable in this case mine was public.user

    const posts = await getConnection().query(
      `
        select p.*,
        json_build_object(
          'id', u.id,
          'username', u.username,
          'email', u.email,
          'createdAt', u."createdAt",
          'updatedAt', u."updatedAt"
        ) creator
        from post p
        inner join public.user u on u.id = p."creatorId"
        ${cursor ? `where p."createdAt" < $2` : ""}
        order by p."createdAt" DESC
        limit $1
    `,
      replacements
    );
    // console.log("posts", posts);
    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
  }
  @Query(() => Post, { nullable: true })
  // Arg("id") the ID can be changed to whatever you want, it will reflect the name you put in localhost:4000/graphql.
  post(@Arg("id") id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }
  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({ ...input, creatorId: req.session.userId }).save();
  }
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("title", () => String, { nullable: true }) title: string,
    @Arg("id") id: number
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) return null;
    if (typeof title !== "undefined") {
      await Post.update({ id }, { title });
    }
    return post;
  }
  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<Boolean> {
    await Post.delete(id);
    return true;
  }
}
