import process from "node:process";
import { defineConfig, loadEnv } from "vite";
import { handleAuditRequest } from "./server/openaiAudit.js";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const githubToken = env.GITHUB_TOKEN?.trim();

  return {
    plugins: [
      react(),
      {
        name: "local-ai-audit-api",
        configureServer: (server) => {
          server.middlewares.use("/api/github", (req, res, next) => {
            if (["GET", "HEAD"].includes(req.method)) {
              next();
              return;
            }

            res.statusCode = 405;
            res.setHeader("Allow", "GET, HEAD");
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Method not allowed" }));
          });

          server.middlewares.use("/api/audit", async (req, res) => {
            await handleAuditRequest(req, res, env);
          });
        },
      },
    ],
    server: {
      proxy: {
        "/api/github": {
          target: "https://api.github.com",
          changeOrigin: true,
          secure: true,
          rewrite: (requestPath) => {
            const url = new URL(requestPath, "http://localhost");
            return url.searchParams.get("path") || "/";
          },
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              proxyReq.setHeader("Accept", "application/vnd.github+json");
              proxyReq.setHeader("X-GitHub-Api-Version", "2022-11-28");

              if (githubToken) {
                proxyReq.setHeader("Authorization", `Bearer ${githubToken}`);
              }
            });
          },
        },
      },
    },
  };
});
