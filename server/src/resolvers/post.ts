import { Post } from "../entities/Post";
import { MyContext } from "../types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }
  @Query(() => Post, { nullable: true })
  // Arg("id") the ID can be changed to whatever you want, it will reflect the name you put in localhost:4000/graphql.
  post(@Arg("id") id: number, @Ctx() { em }: MyContext): Promise<Post | null> {
    return em.findOne(Post, { id });
  }
  @Mutation(() => Post)
  async createPost(
    @Arg("title") title: string,
    @Ctx()
    { em }: MyContext
  ): Promise<Post> {
    const post = em.create(Post, { title });
    await em.persistAndFlush(post);
    return post;
  }
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("title", () => String, { nullable: true }) title: string,
    @Arg("id") id: number,
    @Ctx()
    { em }: MyContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    if (!post) return null;
    if (typeof title !== "undefined") {
      post.title = title;
      await em.persistAndFlush(post);
    }
    return post;
  }
  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id") id: number,
    @Ctx()
    { em }: MyContext
  ): Promise<Boolean> {
    await em.nativeDelete(Post, { id });
    return true;
  }
}
