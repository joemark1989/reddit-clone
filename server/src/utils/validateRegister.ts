import { UsernamePasswordInput } from "../resolvers/UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
  if (options.username.length <= 2) {
    return [{ field: "username", message: "length must be greater than 2" }];
  }
  if (!options.email.includes("@")) {
    return [{ field: "email", message: "please use a valid email." }];
  }
  if (options.username.includes("@")) {
    return [{ field: "username", message: "cannot have @ in your username" }];
  }
  if (options.password.length <= 2) {
    return [{ field: "password", message: "length must be greater than 2" }];
  }
  return null;
};
