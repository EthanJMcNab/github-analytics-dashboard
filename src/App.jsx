import { useState } from "react";
import LanguageChart from "./components/LanguageChart";
import LanguageTable from "./components/LanguageTable";

function App() {
  const [repoInput, setRepoInput] = useState(""); // User input for repo
  const [repoData, setRepoData] = useState(null); // Repo data returned from REST GitHub API
  const [error, setError] = useState(""); // Error Handling message, incorrect format/missing repo
  const [loading, setLoading] = useState(false); // Loading state, for fetch requests
  const [languages, setLanguages] = useState([]); // Repo languages data

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
    }
    catch (err) {
      setError(err.message);
    }
    finally {
      setLoading(false);
    }
  }

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

        {repoData && (
          <div style={{ marginTop: "20px" }}>
            <h2>{repoData.full_name}</h2>
            <p>Stars: {repoData.stargazers_count}</p>
            <p>Forks: {repoData.forks_count}</p>
            <p>Open Issues: {repoData.open_issues_count}</p>
          </div>
        )}

        {/* LanguageData Chart */}
        {languages.length > 0 && <LanguageChart data={languages} />}
        {/* LanguageData Table */}
        {languages.length > 0 && <LanguageTable data={languages} />}
      </div>
    </div>
  );
}

export default App;