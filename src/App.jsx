import { useState } from "react";
import CommitSection from "./components/CommitSection";
import LanguageSection from "./components/LanguageSection";
import RepoOverview from "./components/RepoOverview";
import SearchHeader from "./components/SearchHeader";
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
      <SearchHeader
        repoInput={repoInput}
        onRepoInputChange={setRepoInput}
        onSearch={handleSearch}
      />

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

        <RepoOverview repoData={repoData} repoStats={repoStats} />
        <LanguageSection languages={languages} />
        <CommitSection
          commitActivity={commitActivity}
          commitInsights={commitInsights}
          displayedCommitActivity={displayedCommitActivity}
          onCommitRangeChange={setCommitRange}
        />

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
