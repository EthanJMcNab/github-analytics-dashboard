import CommitActivityChart from "./CommitActivityChart";

const STANDARD_COMMIT_RANGES = [12, 26, 52];

function getCommitRangeOptions(availableWeeks) {
  const options = STANDARD_COMMIT_RANGES.filter((range) => range <= availableWeeks);

  if (availableWeeks > 0 && !options.includes(availableWeeks)) {
    options.push(availableWeeks);
  }

  return options;
}

function CommitSection({
  commitActivity,
  commitInsights,
  displayedCommitActivity,
  effectiveCommitRange,
  onCommitRangeChange,
}) {
  if (!commitActivity.length) {
    return null;
  }

  const commitRangeOptions = getCommitRangeOptions(commitActivity.length);

  return (
    <section className="commitSection">
      <div className="commitControls">
        {commitRangeOptions.map((range) => (
          <button
            className={effectiveCommitRange === range ? "active" : ""}
            key={range}
            onClick={() => onCommitRangeChange(range)}
            type="button"
          >
            {range === commitActivity.length && !STANDARD_COMMIT_RANGES.includes(range)
              ? `${range}W available`
              : `${range}W`}
          </button>
        ))}
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
                <span>Total Commits ({effectiveCommitRange}W)</span>
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
