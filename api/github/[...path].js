const GITHUB_API_BASE_URL = "https://api.github.com";

async function readRequestBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  return chunks.length ? Buffer.concat(chunks) : undefined;
}

export default async function handler(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const githubPath = requestUrl.pathname.replace(/^\/api\/github/, "") || "/";
  const targetUrl = `${GITHUB_API_BASE_URL}${githubPath}${requestUrl.search}`;
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
}
