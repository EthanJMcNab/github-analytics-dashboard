function SearchHeader({ repoInput, onRepoInputChange, onSearch }) {
  return (
    <div className="hero">
      <h1>GitHub Analytics Dashboard</h1>

      <form
        className="searchBar"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
      >
        <input
          type="text"
          placeholder="owner/repo"
          value={repoInput}
          onChange={(e) => onRepoInputChange(e.target.value)}
        />

        <button type="submit">Search</button>
      </form>
    </div>
  );
}

export default SearchHeader;
