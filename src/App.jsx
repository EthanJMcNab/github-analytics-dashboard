import { useState } from "react";
import LanguageChart from "./components/LanguageChart";
import LanguageTable from "./components/LanguageTable";
import CommitActivityChart from "./components/CommitActivityChart";
import {
  buildRepoStats,
  formatLanguages,
  getCommitInsights,
  getDisplayedCommitActivity,
} from "./utils/repositoryAnalytics";

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
    setCommitActivity([]);

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

      if (!langRes.ok) {
        throw new Error("Failed to fetch language data");
      }

      setLanguages(formatLanguages(langData));

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

        if (!Array.isArray(activityData)) {
          throw new Error("Invalid commit activity data returned by GitHub");
        }

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
  const repoStats = buildRepoStats(repoData);
  const displayedCommitActivity = getDisplayedCommitActivity(commitActivity, commitRange);
  const commitInsights = getCommitInsights(commitActivity, commitRange);

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
