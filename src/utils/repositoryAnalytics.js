export function formatLanguages(languageData) {
  return Object.entries(languageData).map(([name, value]) => ({
    name,
    value,
  }));
}

export function buildRepoStats(repoData) {
  if (!repoData) {
    return [];
  }

  return [
    { label: "Stars", value: repoData.stargazers_count },
    { label: "Forks", value: repoData.forks_count },
    { label: "Open Issues", value: repoData.open_issues_count },
    { label: "Primary Language", value: repoData.language || "N/A" },
    { label: "Last Updated", value: new Date(repoData.updated_at).toLocaleDateString() },

    { label: "Watchers", value: repoData.watchers_count },
    { label: "Default Branch", value: repoData.default_branch },
    { label: "Created Date", value: new Date(repoData.created_at).toLocaleDateString() },
    { label: "License", value: repoData.license?.name || "None" },
    { label: "Size", value: `${(repoData.size / 1024).toFixed(1)} MB` },
  ];
}

export function getDisplayedCommitActivity(commitActivity, commitRange) {
  return commitActivity
    .slice(-commitRange)
    .map((week) => ({
      name: new Date(week.week * 1000).toLocaleDateString("en-AU", {
        day: "2-digit",
        month: "short",
      }),
      commits: week.total,
    }));
}

export function getCommitInsights(commitActivity, commitRange) {
  if (!commitActivity.length) {
    return null;
  }

  const currentPeriod = commitActivity.slice(-commitRange);
  const previousPeriod = commitActivity.slice(-commitRange * 2, -commitRange);

  const totalCommits = currentPeriod.reduce((sum, week) => sum + week.total, 0);

  const averagePerWeek =
    currentPeriod.length > 0 ? (totalCommits / currentPeriod.length).toFixed(1) : "0.0";

  const peakWeek = currentPeriod.reduce(
    (max, week) => (week.total > max.total ? week : max),
    currentPeriod[0]
  );

  const inactiveWeeks = currentPeriod.filter((week) => week.total === 0).length;
  const previousTotal = previousPeriod.reduce((sum, week) => sum + week.total, 0);

  let trend = "No prior data";

  if (commitRange === commitActivity.length) {
    trend = "Trend: N/A (full range selected)";
  }

  if (previousPeriod.length > 0) {
    if (previousTotal === 0 && totalCommits > 0) {
      trend = "↑ New activity";
    } else if (previousTotal === 0 && totalCommits === 0) {
      trend = "No change";
    } else {
      const percentChange = (((totalCommits - previousTotal) / previousTotal) * 100).toFixed(1);
      const direction = percentChange >= 0 ? "↑" : "↓";
      trend = `${direction} ${Math.abs(percentChange)}% vs previous period`;
    }
  }

  return {
    totalCommits,
    averagePerWeek,
    peakWeek: peakWeek?.total ?? 0,
    inactiveWeeks,
    trend,
  };
}
