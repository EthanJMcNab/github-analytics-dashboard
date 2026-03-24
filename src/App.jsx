import { useState } from "react";

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
    <div>
      <h1>GitHub Analytics Dashboard</h1>

      <input
        type="text"
        placeholder="owner/repo"
        value={repoInput}
        onChange={(e) => setRepoInput(e.target.value)}
      />

      <button onClick={handleSearch}>Search</button>

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

    </div>
  );
}

export default App;