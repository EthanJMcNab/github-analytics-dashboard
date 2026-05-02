function IssueHealthSection({ issueHealth }) {
  if (!issueHealth) {
    return null;
  }

  const metrics = [
    { label: "Open Issues", value: issueHealth.openCount },
    { label: "Closed Issues", value: issueHealth.closedCount },
    { label: "Recently Opened", value: issueHealth.recentlyOpenedCount },
    { label: "Stale Issues", value: issueHealth.staleCount },
    { label: "Oldest Open Issue", value: `${issueHealth.oldestOpenIssueAge} days` },
    { label: "Status", value: issueHealth.status },
  ];

  return (
    <section className="issueHealthSection">
      <div className="sectionHeader">
        <h2>Issue Health</h2>
        <p>Backlog size, age, and triage signals</p>
      </div>

      <div className="issueHealthGrid">
        {metrics.map((metric) => (
          <div className="issueMetric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>

      {issueHealth.topLabels.length > 0 && (
        <div className="issueLabels">
          <span>Common Labels</span>
          <div>
            {issueHealth.topLabels.map((label) => (
              <strong key={label.name}>
                {label.name} ({label.count})
              </strong>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default IssueHealthSection;
