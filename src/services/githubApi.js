import { formatLanguages } from "../utils/repositoryAnalytics";

const GITHUB_API_BASE_URL = "/api/github";
const COMMIT_ACTIVITY_RETRY_DELAY_MS = 1000;
const COMMIT_ACTIVITY_RETRY_LIMIT = 5;
const STALE_ISSUE_THRESHOLD_DAYS = 30;
const READINESS_CHECKS = [
  {
    description: "Helps developers understand the project quickly.",
    label: "README",
    paths: ["README.md", "readme.md"],
  },
  {
    description: "Clarifies how the code can be used or reused.",
    label: "License",
    paths: ["LICENSE", "LICENSE.md", "license.md"],
  },
  {
    description: "Explains how others should contribute.",
    label: "Contributing Guide",
    paths: ["CONTRIBUTING.md", ".github/CONTRIBUTING.md"],
  },
  {
    description: "Sets expectations for community behaviour.",
    label: "Code of Conduct",
    paths: ["CODE_OF_CONDUCT.md", ".github/CODE_OF_CONDUCT.md"],
  },
  {
    description: "Signals automated validation for changes.",
    label: "CI Workflow",
    paths: [".github/workflows"],
  },
  {
    description: "Provides a responsible disclosure path.",
    label: "Security Policy",
    paths: ["SECURITY.md", ".github/SECURITY.md"],
  },
  {
    description: "Identifies project dependencies and scripts.",
    label: "Package Metadata",
    paths: ["package.json"],
  },
];

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getWeekStartTimestamp(dateString) {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());

  return Math.floor(date.getTime() / 1000);
}

function formatRecentCommitsAsWeeklyActivity(commits) {
  const weeklyTotals = new Map();

  commits.forEach((item) => {
    const commitDate = item.commit?.committer?.date || item.commit?.author?.date;

    if (!commitDate) {
      return;
    }

    const week = getWeekStartTimestamp(commitDate);
    weeklyTotals.set(week, (weeklyTotals.get(week) || 0) + 1);
  });

  return Array.from(weeklyTotals.entries())
    .sort(([weekA], [weekB]) => weekA - weekB)
    .map(([week, total]) => ({
      week,
      total,
    }));
}

function githubFetch(url) {
  return fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
}

async function fetchJson(url, errorMessage) {
  const response = await githubFetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return data;
}

async function pathExists(owner, repo, path) {
  const response = await githubFetch(
    `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contents/${path}`
  );

  return response.ok;
}

function getDaysSince(dateString) {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();

  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function getIssueSearchUrl(owner, repo, state) {
  const query = encodeURIComponent(`repo:${owner}/${repo} type:issue state:${state}`);

  return `${GITHUB_API_BASE_URL}/search/issues?q=${query}`;
}

async function fetchIssueCount(owner, repo, state) {
  const data = await fetchJson(
    getIssueSearchUrl(owner, repo, state),
    `Failed to fetch ${state} issue count`
  );

  return data.total_count ?? 0;
}

function getTopLabels(issues) {
  const labelCounts = new Map();

  issues.forEach((issue) => {
    issue.labels.forEach((label) => {
      labelCounts.set(label.name, (labelCounts.get(label.name) || 0) + 1);
    });
  });

  return Array.from(labelCounts.entries())
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count,
    }));
}

function getIssueHealthStatus(openCount, staleCount) {
  if (openCount === 0) {
    return "No open issue backlog";
  }

  if (staleCount === 0 && openCount <= 10) {
    return "Manageable backlog";
  }

  if (staleCount > openCount / 2) {
    return "Needs triage";
  }

  return "Active backlog";
}

export async function fetchRepository(owner, repo) {
  return fetchJson(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}`, "Repository Not Found");
}

export async function fetchLanguages(owner, repo) {
  const languageData = await fetchJson(
    `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/languages`,
    "Failed to fetch language data"
  );

  return formatLanguages(languageData);
}

export async function fetchCommitActivity(owner, repo) {
  for (let attempt = 0; attempt <= COMMIT_ACTIVITY_RETRY_LIMIT; attempt += 1) {
    const response = await githubFetch(
      `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/stats/commit_activity`
    );

    if (response.status !== 202) {
      const activityData = await response.json();

      if (!response.ok) {
        throw new Error("Failed to fetch commit activity");
      }

      if (!Array.isArray(activityData)) {
        throw new Error("Invalid commit activity data returned by GitHub");
      }

      return activityData;
    }

    if (attempt < COMMIT_ACTIVITY_RETRY_LIMIT) {
      await wait(COMMIT_ACTIVITY_RETRY_DELAY_MS);
    }
  }

  const commitsData = await fetchJson(
    `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/commits?per_page=100`,
    "Commit activity is still being generated by GitHub. Please try again shortly."
  );

  if (!Array.isArray(commitsData)) {
    throw new Error("Invalid commits data returned by GitHub");
  }

  return formatRecentCommitsAsWeeklyActivity(commitsData);
}

export async function fetchProjectReadiness(owner, repo) {
  return Promise.all(
    READINESS_CHECKS.map(async (check) => {
      const exists = await Promise.any(
        check.paths.map(async (path) => {
          if (await pathExists(owner, repo, path)) {
            return path;
          }

          throw new Error(`${path} not found`);
        })
      ).catch(() => null);

      return {
        description: check.description,
        label: check.label,
        passed: Boolean(exists),
        path: exists,
      };
    })
  );
}

export async function fetchIssueHealth(owner, repo) {
  const [openCount, closedCount, issuesData] = await Promise.all([
    fetchIssueCount(owner, repo, "open"),
    fetchIssueCount(owner, repo, "closed"),
    fetchJson(
      `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/issues?state=open&per_page=100`,
      "Failed to fetch open issues"
    ),
  ]);

  const openIssues = issuesData.filter((issue) => !issue.pull_request);
  const staleIssues = openIssues.filter(
    (issue) => getDaysSince(issue.updated_at) >= STALE_ISSUE_THRESHOLD_DAYS
  );
  const recentlyOpened = openIssues.filter((issue) => getDaysSince(issue.created_at) <= 14);
  const oldestOpenIssueAge = openIssues.length
    ? Math.max(...openIssues.map((issue) => getDaysSince(issue.created_at)))
    : 0;

  return {
    closedCount,
    openCount,
    oldestOpenIssueAge,
    recentlyOpenedCount: recentlyOpened.length,
    staleCount: staleIssues.length,
    status: getIssueHealthStatus(openCount, staleIssues.length),
    topLabels: getTopLabels(openIssues),
  };
}
