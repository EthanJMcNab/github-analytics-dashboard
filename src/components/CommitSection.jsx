import CommitActivityChart from "./CommitActivityChart";

function CommitSection({
  commitActivity,
  commitInsights,
  displayedCommitActivity,
  onCommitRangeChange,
}) {
  if (!commitActivity.length) {
    return null;
  }

  return (
    <section className="commitSection">
      <div className="commitControls">
        <button onClick={() => onCommitRangeChange(12)}>12W</button>
        <button onClick={() => onCommitRangeChange(26)}>26W</button>
        <button onClick={() => onCommitRangeChange(52)}>52W</button>
      </div>

      <div className="commitGrid">
        <div className="card">
          <CommitActivityChart data={displayedCommitActivity} />
        </div>

        {commitInsights && (
          <div className="card commitInsights">
            <h2 className="commitInsightsTitle">Commit Insights</h2>

            <div className="commitInsightsList">
              <div className="insightItem">
                <span>Total Commits</span>
                <strong>{commitInsights.totalCommits}</strong>
              </div>

              <div className="insightItem">
                <span>Avg / Week</span>
                <strong>{commitInsights.averagePerWeek}</strong>
              </div>

              <div className="insightItem">
                <span>Peak Week</span>
                <strong>{commitInsights.peakWeek}</strong>
              </div>

              <div className="insightItem">
                <span>Inactive Weeks</span>
                <strong>{commitInsights.inactiveWeeks}</strong>
              </div>

              <div className="insightItem">
                <span>Trend</span>
                <strong>{commitInsights.trend}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default CommitSection;
