import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// Git hook endpoint — API key validated from request header
http.route({
  path: "/dev-logs",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const apiKey = request.headers.get("x-api-key");
    const expectedKey = process.env.API_KEY;

    if (!expectedKey || apiKey !== expectedKey) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const { repo, branch, commitHash, message } = body;

    if (!repo || !branch || !commitHash || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const id = await ctx.runMutation(internal.devLogs.createDevLog, {
      repo,
      branch,
      commitHash,
      message,
    });

    return new Response(JSON.stringify({ id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
