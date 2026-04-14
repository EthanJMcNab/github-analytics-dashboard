import { useState } from "react";
import LanguageChart from "./components/LanguageChart";
import LanguageTable from "./components/LanguageTable";
import CommitActivityChart from "./components/CommitActivityChart";

function App() {
  const [repoInput, setRepoInput] = useState(""); // User input for repo
  const [repoData, setRepoData] = useState(null); // Repo data returned from REST GitHub API
  const [error, setError] = useState(""); // Error Handling message, incorrect format/missing repo
  const [loading, setLoading] = useState(false); // Loading state, for fetch requests
  const [languages, setLanguages] = useState([]); // Repo languages data
  const [commitActivity, setCommitActivity] = useState([]); // Stores commit data
  const [commitRange, setCommitRange] = useState(12); // Stores amount of weeks pulled from API for commit chart (Default 3 months)

  const handleSearch = async () => {
    setError("");
    setRepoData(null);
    setLanguages([]);

    const trimmedInput = repoInput.trim();
    const [owner, repo] = trimmedInput.split("/");

    if (!owner || !repo) {
      setError("Please use format: owner/repo")
      return;
    }

    try {

      setLoading(true);

      // Fetch Repository
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error("Repository Not Found")
      }

      setRepoData(data);

      // Fetch Languages data
      const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`);
      const langData = await langRes.json();

      // Convert GitHub language object to array
      const formattedLanguages = Object.entries(langData).map(([name, value]) => ({
        name,
        value,
      }));

      setLanguages(formattedLanguages);

      // Fetch weekly commit data from GitHub API (last 52 weeks)
      const activityRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`
      );

      // GitHub API returns 202 when stats are being generated and are not yet ready
      if (activityRes.status === 202) {
        setCommitActivity([]);
      } else if (!activityRes.ok) {
        throw new Error("Failed to fetch commit activity");
      } else {
        const activityData = await activityRes.json();
        setCommitActivity(activityData);
      }

    }
    catch (err) {
      setError(err.message);
    }
    finally {
      setLoading(false);
    }
  }
  // Repo Statistics formatted for the stat summary cards (underneath the hero)
  const repoStats = repoData
    ? [
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
    ]
    : [];

  // Slices the recent weeks into weekly commit data, allowing the chart to accept it
  const displayedCommitActivity = commitActivity
    .slice(-commitRange)
    .map((week) => ({
      name: new Date(week.week * 1000).toLocaleDateString("en-AU", {
        day: "2-digit",
        month: "short",
      }),
      commits: week.total,
    }));

  // Derived commit insights for the selected date range
  const commitInsights = (() => {
    if (!commitActivity.length) {
      return null;
    }

    // Current selected period
    const currentPeriod = commitActivity.slice(-commitRange);

    // Previous period of the same length, immediately before the current one
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
      trend = "Full Dataset";
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
  })();

  return (
    <div className="app">
      <div className="hero">
        <h1>GitHub Analytics Dashboard</h1>

        <form
          className="searchBar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <input
            type="text"
            placeholder="owner/repo"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
          />

          <button type="submit">Search</button>
        </form>
      </div>

      <div className="results">
        {loading && (
          <div className="loaderWrapper">
            <div className="loader"></div>
          </div>
        )}

        {error && (
          <div className="errorBox">
            <p className="errorTitle">Something went wrong</p>
            <p className="errorMessage">{error}</p>
          </div>
        )}

        {/*Repo Name, Description & Stats*/}
        {repoData && (
          <section className="repoSection">
            <div className="repoHeader">
              <h2 className="repoTitle">
                <a href={repoData.html_url} target="_blank" rel="noreferrer">
                  {repoData.full_name}
                </a>
              </h2>

              {repoData.description && (
                <p className="repoDescription">
                  {repoData.description}
                </p>
              )}
            </div>

            <div className="statsGrid">
              {repoStats.map((stat, index) => (
                <div className="statCard" key={index}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* LanguageData Chart & Table*/}
        {languages.length > 0 && (
          <section className="languagesSection">
            <div className="languagesGrid">
              <div className="card">
                <LanguageChart data={languages} />
              </div>

              <div className="card">
                <LanguageTable data={languages} />
              </div>
            </div>
          </section>
        )}

        {/* Commit Activity */}
        {/* Github API Pushes only 52 weeks of commit data, hence this is the limitation of the chart */}
        {commitActivity.length > 0 && (
          <section className="commitSection">
            <div className="commitControls">
              <button onClick={() => setCommitRange(12)}>12W</button>
              <button onClick={() => setCommitRange(26)}>26W</button>
              <button onClick={() => setCommitRange(52)}>52W</button>
            </div>

            <div className="commitGrid">
              <div className="card">
                <CommitActivityChart data={displayedCommitActivity} />
              </div>

              {commitInsights && (
                <div className="card commitInsights">
                  <h2 className="commitInsightsTitle">Commit Insights</h2>

                  <div className="commitInsightsList">
                    <div className="insightItem">
                      <span>Total Commits</span>
                      <strong>{commitInsights.totalCommits}</strong>
                    </div>

                    <div className="insightItem">
                      <span>Avg / Week</span>
                      <strong>{commitInsights.averagePerWeek}</strong>
                    </div>

                    <div className="insightItem">
                      <span>Peak Week</span>
                      <strong>{commitInsights.peakWeek}</strong>
                    </div>

                    <div className="insightItem">
                      <span>Inactive Weeks</span>
                      <strong>{commitInsights.inactiveWeeks}</strong>
                    </div>

                    <div className="insightItem">
                      <span>Trend</span>
                      <strong>{commitInsights.trend}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

      </div>
      <div className="footer">
        <p>
          Created by Ethan J McNab. Data sourced via GitHub API.
        </p>
      </div>
    </div>
  );
}

export default App;