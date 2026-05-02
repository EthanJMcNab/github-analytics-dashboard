function ReadinessSection({ checks }) {
  if (!checks.length) {
    return null;
  }

  const passedCount = checks.filter((check) => check.passed).length;

  return (
    <section className="readinessSection">
      <div className="sectionHeader">
        <h2>Project Readiness</h2>
        <p>
          {passedCount} of {checks.length} checks passing
        </p>
      </div>

      <div className="readinessGrid">
        {checks.map((check) => (
          <div className="readinessItem" key={check.label}>
            <div className="readinessItemHeader">
              <span className={check.passed ? "statusPass" : "statusMissing"}>
                {check.passed ? "Present" : "Missing"}
              </span>
              <strong>{check.label}</strong>
            </div>

            <p>{check.description}</p>

            {check.path && (
              <span className="readinessPath">{check.path}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default ReadinessSection;
