export async function fetchRepositoryAudit(snapshot) {
  const response = await fetch("/api/audit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ snapshot }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "Failed to generate AI repository audit");
  }

  if (!data?.audit) {
    throw new Error("AI audit response was missing audit data");
  }

  return data.audit;
}
