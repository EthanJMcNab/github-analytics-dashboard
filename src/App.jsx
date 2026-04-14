import { useState } from "react";
import LanguageChart from "./components/LanguageChart";
import LanguageTable from "./components/LanguageTable";

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
    .map((week, index) => ({
      name: `W${index + 1}`,
      commits: week.total,
    }));

  return (
    <div className="app">
      <div className="hero">
        <h1>GitHub Analytics Dashboard</h1>

        <div className="searchBar">
          <input
            type="text"
            placeholder="owner/repo"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
          />

          <button onClick={handleSearch}>Search</button>
        </div>
      </div>

      <div className="results">
        {loading && (
          <p style={{ color: "black", marginTop: "10px" }}>
            {"Loading..."}
          </p>
        )}

        {error && (
          <p style={{ color: "red", marginTop: "10px" }}>
            {error}
          </p>
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