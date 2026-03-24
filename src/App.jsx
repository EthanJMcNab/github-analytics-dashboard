import { useState } from "react";

function App() {
  const [repoInput, setRepoInput] = useState("");
  const [repoData, setRepoData] = useState(null);

  const handleSearch = async () => {
  const [owner, repo] = repoInput.split("/");

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  const data = await res.json();

  setRepoData(data);
  }

  return (
    <div>
      <h1>GitHub Analytics Dashboard</h1>

      <input
        type = "text"
        placeholder = "GitHub Repository Link"
        value = {repoInput}
        onChange = {(e) => setRepoInput(e.target.value)}
      />

      <button onClick={handleSearch}>Search</button>

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