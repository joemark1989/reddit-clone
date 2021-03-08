import argon2 from "argon2";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { getConnection } from "typeorm";
import { v4 } from "uuid";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { User } from "../entities/User";
import { MyContext } from "../types";
import { sendEmail } from "../utils/sendEmail";
import { validateRegister } from "../utils/validateRegister";
import { UsernamePasswordInput } from "./UsernamePasswordInput";

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          { field: "newPassword", message: "length must be greater than 2" },
        ],
      };
    }
    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [{ field: "token", message: "token expired" }],
      };
    }
    const userIdNum = +userId;
    const user = await User.findOne(userIdNum);
    if (!user) {
      return {
        errors: [{ field: "token", message: "user no longer exists" }],
      };
    }
    // at the end if all checks pass, change the password and log user in.
    User.update(
      { id: userIdNum },
      {
        password: await argon2.hash(newPassword),
      }
    );
    // delete token key
    await redis.del(key);
    // this is where it logs the user in if you want the user to type the PW again....
    req.session.userId = user.id; // Then Remove this line
    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    // if we are searching for something but you don't have the primary key like the id or userid.
    // then we can do a where claus.
    const user = await User.findOne({ where: { email } });
    if (!user) {
      //email not in db we return true to hide the fact the email exists.
      // reason we hide it is a security reason so people don't fish for emails.
      return true;
    }
    const token = v4();
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    );
    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    );
    return true;
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    // checks to see if u are logged in. As a simple test in dev mode.
    if (!req.session.userId) {
      return null;
    }
    // return promise of the user
    return User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  @Query(() => String)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }
    const hashedPasword = await argon2.hash(options.password);
    let user;
    try {
      // this line of multi line of code is the equivlient to line 135 - 145.
      // one just builds the query the other just lets typeorm take care of it.
      /* User.create({          
          username: options.username,
          email: options.email,
          password: hashedPasword,}).save();
      */
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          email: options.email,
          password: hashedPasword,
        })
        .returning("*")
        .execute();
      user = result.raw[0];
    } catch (err) {
      if (err.code === "23505") {
        //|| err.detail.includes("already exists"))
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        };
      }
    }
    req.session!.userId = user.id;
    return { user };
  }
  @Mutation(() => UserResponse)
  @Query(() => String)
  async login(
    @Arg("usernameOrEmail") userNameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    // can toLowerCase this for case (User, { username: options.username.toLowerCase() });
    const user = await User.findOne(
      userNameOrEmail.includes("@")
        ? { where: { email: userNameOrEmail } }
        : { where: { username: userNameOrEmail } }
    );
    if (!user) {
      return {
        errors: [
          { field: "usernameOrEmail", message: "that username doesn't exist." },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [{ field: "password", message: "password is incorrect" }],
      };
    }
    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
