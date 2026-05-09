const GITHUB_API_BASE_URL = "https://api.github.com";

async function readRequestBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  return chunks.length ? Buffer.concat(chunks) : undefined;
}

function getGitHubPath(req) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const path = requestUrl.searchParams.get("path");

  if (!path?.startsWith("/")) {
    throw new Error("Missing GitHub API path.");
  }

  return path;
}

export default async function handler(req, res) {
  try {
    const githubPath = getGitHubPath(req);
    const targetUrl = `${GITHUB_API_BASE_URL}${githubPath}`;
    const githubToken = process.env.GITHUB_TOKEN?.trim();

    const headers = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    if (githubToken) {
      headers.Authorization = `Bearer ${githubToken}`;
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : await readRequestBody(req),
    });

    const contentType = response.headers.get("content-type");
    const body = Buffer.from(await response.arrayBuffer());

    res.statusCode = response.status;

    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    res.end(body);
  } catch (error) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: error instanceof Error ? error.message : "GitHub proxy request failed.",
      })
    );
  }
}
