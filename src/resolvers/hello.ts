import { Query, Resolver } from "type-graphql";

@Resolver()
export class HellResolver {
  @Query(() => String)
  hello() {
    return "hello world";
  }
}
