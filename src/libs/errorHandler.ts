import { Elysia } from "elysia";

export const ErrorHandler = new Elysia().onError(
  ({ code, error, set, request }) => {
    //let {pathname}  = new URL(request.url)
    if (code === "NOT_FOUND") {
      set.redirect = "/";
      return "Not Found !!! :(";
    }
    console.log("ssssssssssssssssss");
  }
);
