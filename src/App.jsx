import { useState } from "react";

function App() {
  const [repoInput, setRepoInput] = useState("");
  const [repoData, setRepoData] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setError("");
    setRepoData("");

    const trimmedInput = repoInput.trim();
    const [owner, repo] = repoInput.split("/");

    if (!owner || !repo) {
      setError("Please use format: owner/repo.")
      return;
    }

    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      const data = await res.json();

      if (!res.ok) {
        setError("Repository Not Found.")
      }
    }
    catch (err) {
      setError(err.message);
    }

    setRepoData(data);
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