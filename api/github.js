const GITHUB_API_BASE_URL = "https://api.github.com";

function getGitHubPath(req) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const path = requestUrl.searchParams.get("path");

  if (!path?.startsWith("/")) {
    throw new Error("Missing GitHub API path.");
  }

  return path;
}

export default async function handler(req, res) {
  if (!["GET", "HEAD"].includes(req.method)) {
    res.statusCode = 405;
    res.setHeader("Allow", "GET, HEAD");
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

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
