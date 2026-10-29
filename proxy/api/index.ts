import { cors } from "./_github.js";
import codeHandler from "./code.js";
import tokenHandler from "./token.js";

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === "/api/code") {
      return codeHandler(req, env);
    }
    if (path === "/api/token") {
      return tokenHandler(req, env);
    }

    return new Response("Not Found", { status: 404 });
  },
};