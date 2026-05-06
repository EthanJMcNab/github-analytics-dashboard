function AiAuditSection({ audit, error, loading, onGenerateAudit, snapshotReady }) {
  if (!snapshotReady) {
    return null;
  }

  return (
    <section className="aiAuditSection">
      <div className="sectionHeader">
        <h2>AI Repository Audit</h2>
        <p>Structured engineering review grounded in the dashboard data</p>
      </div>

      <div className="aiAuditShell">
        <div className="aiAuditIntro">
          <div>
            <span className="aiAuditEyebrow">Evidence-based AI</span>
            <h3>Turn repository signals into an engineering health review.</h3>
          </div>

          <button disabled={loading} onClick={onGenerateAudit} type="button">
            {loading ? "Auditing..." : audit ? "Regenerate Audit" : "Generate Audit"}
          </button>
        </div>

        {error && (
          <div className="aiAuditError">
            <strong>Audit unavailable</strong>
            <span>{error}</span>
          </div>
        )}

        {audit && (
          <div className="aiAuditResults">
            <div className="aiAuditScorePanel">
              <span>Health Score</span>
              <strong>{audit.score}</strong>
              <p>{audit.summary}</p>
              <small>Model confidence: {audit.modelConfidence}</small>
            </div>

            <div className="aiAuditStrengths">
              <h3>Strengths</h3>
              <ul>
                {audit.strengths.map((strength) => (
                  <li key={strength}>{strength}</li>
                ))}
              </ul>
            </div>

            <div className="aiAuditFindings">
              <h3>Findings</h3>

              {audit.findings.map((finding) => (
                <article className="aiFinding" key={`${finding.area}-${finding.evidence}`}>
                  <div className="aiFindingHeader">
                    <span className={`severityBadge severity-${finding.severity}`}>
                      {finding.severity}
                    </span>
                    <strong>{finding.area}</strong>
                  </div>

                  <p>{finding.evidence}</p>
                  <span>{finding.recommendation}</span>
                </article>
              ))}
            </div>

            <div className="aiAuditActions">
              <h3>Next Actions</h3>

              {audit.nextActions.map((action) => (
                <article key={action.title}>
                  <strong>{action.title}</strong>
                  <p>{action.rationale}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default AiAuditSection;
