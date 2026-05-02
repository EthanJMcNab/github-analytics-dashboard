function RepoOverview({ repoData, repoStats }) {
  if (!repoData) {
    return null;
  }

  return (
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
        {repoStats.map((stat) => (
          <div className="statCard" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RepoOverview;
