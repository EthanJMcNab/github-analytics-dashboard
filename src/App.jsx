import { useState } from "react";
import CommitSection from "./components/CommitSection";
import IssueHealthSection from "./components/IssueHealthSection";
import LanguageSection from "./components/LanguageSection";
import ReadinessSection from "./components/ReadinessSection";
import RepoOverview from "./components/RepoOverview";
import SearchHeader from "./components/SearchHeader";
import {
  fetchCommitActivity,
  fetchIssueHealth,
  fetchLanguages,
  fetchProjectReadiness,
  fetchRepository,
} from "./services/githubApi";
import {
  buildRepoStats,
  getCommitInsights,
  getDisplayedCommitActivity,
  getEffectiveCommitRange,
} from "./utils/repositoryAnalytics";

function App() {
  const [repoInput, setRepoInput] = useState(""); // User input for repo
  const [repoData, setRepoData] = useState(null); // Repo data returned from REST GitHub API
  const [error, setError] = useState(""); // Error Handling message, incorrect format/missing repo
  const [loading, setLoading] = useState(false); // Loading state, for fetch requests
  const [languages, setLanguages] = useState([]); // Repo languages data
  const [commitActivity, setCommitActivity] = useState([]); // Stores commit data
  const [issueHealth, setIssueHealth] = useState(null); // Issue backlog and triage signals
  const [readinessChecks, setReadinessChecks] = useState([]); // Project readiness metadata
  const [commitRange, setCommitRange] = useState(12); // Stores amount of weeks pulled from API for commit chart (Default 3 months)

  const handleSearch = async () => {
    setError("");
    setRepoData(null);
    setLanguages([]);
    setCommitActivity([]);
    setIssueHealth(null);
    setReadinessChecks([]);

    const trimmedInput = repoInput.trim();
    const [owner, repo] = trimmedInput.split("/");

    if (!owner || !repo) {
      setError("Please use format: owner/repo")
      return;
    }

    try {

      setLoading(true);

      const data = await fetchRepository(owner, repo);
      const languageData = await fetchLanguages(owner, repo);
      const activityData = await fetchCommitActivity(owner, repo);
      const issueData = await fetchIssueHealth(owner, repo);
      const readinessData = await fetchProjectReadiness(owner, repo);

      setRepoData(data);
      setLanguages(languageData);
      setCommitActivity(activityData);
      setIssueHealth(issueData);
      setReadinessChecks(readinessData);
    }
    catch (err) {
      setError(err.message);
    }
    finally {
      setLoading(false);
    }
  }
  const repoStats = buildRepoStats(repoData);
  const effectiveCommitRange = getEffectiveCommitRange(commitActivity, commitRange);
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
        <ReadinessSection checks={readinessChecks} />
        <IssueHealthSection issueHealth={issueHealth} />
        <LanguageSection languages={languages} />
        <CommitSection
          commitActivity={commitActivity}
          commitInsights={commitInsights}
          displayedCommitActivity={displayedCommitActivity}
          effectiveCommitRange={effectiveCommitRange}
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
