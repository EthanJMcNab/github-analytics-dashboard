const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_OPENAI_MODEL = "gpt-5-mini";

const AUDIT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["score", "summary", "modelConfidence", "strengths", "findings", "nextActions"],
  properties: {
    score: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description: "Overall repository health score from 0 to 100.",
    },
    summary: {
      type: "string",
      description: "Short executive summary of repository health.",
    },
    modelConfidence: {
      type: "string",
      enum: ["low", "medium", "high"],
      description: "Confidence based only on the provided analytics snapshot.",
    },
    strengths: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "string",
      },
    },
    findings: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["severity", "area", "evidence", "recommendation"],
        properties: {
          severity: {
            type: "string",
            enum: ["low", "medium", "high"],
          },
          area: {
            type: "string",
            enum: [
              "activity",
              "community",
              "documentation",
              "maintainability",
              "release-readiness",
              "security",
            ],
          },
          evidence: {
            type: "string",
            description: "Specific signal from the supplied snapshot.",
          },
          recommendation: {
            type: "string",
            description: "Concrete next step grounded in the evidence.",
          },
        },
      },
    },
    nextActions: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "rationale"],
        properties: {
          title: {
            type: "string",
          },
          rationale: {
            type: "string",
          },
        },
      },
    },
  },
};

function extractOutputText(responseData) {
  if (typeof responseData.output_text === "string") {
    return responseData.output_text;
  }

  const outputText = responseData.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === "output_text")?.text;

  return outputText ?? "";
}

function validateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") {
    throw new Error("Repository analytics snapshot is required.");
  }

  if (!snapshot.repository?.fullName) {
    throw new Error("Repository snapshot must include repository.fullName.");
  }
}

function buildAuditPrompt(snapshot) {
  return `Analyze this GitHub repository analytics snapshot and produce an evidence-based engineering health audit. Only use the data in the snapshot. Do not invent files, dependencies, vulnerabilities, contributors, or CI results that are not present. Be practical for a working engineer preparing the repository for employers or collaborators.\n\nRepository analytics snapshot JSON:\n${JSON.stringify(snapshot, null, 2)}`;
}

export async function createRepositoryAudit(snapshot, options = {}) {
  validateSnapshot(snapshot);

  const apiKey = options.apiKey?.trim();
  const model = options.model?.trim() || DEFAULT_OPENAI_MODEL;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required to run the AI repository audit.");
  }

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content:
            "You are a senior software engineering reviewer. Return a concise, evidence-based repository health audit as structured JSON. Ground every finding in the supplied analytics snapshot.",
        },
        {
          role: "user",
          content: buildAuditPrompt(snapshot),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "repository_audit",
          strict: true,
          schema: AUDIT_SCHEMA,
        },
      },
      max_output_tokens: 1800,
    }),
  });

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = responseData?.error?.message || "OpenAI audit request failed.";
    throw new Error(detail);
  }

  const outputText = extractOutputText(responseData);

  if (!outputText) {
    throw new Error("OpenAI returned an empty audit response.");
  }

  return JSON.parse(outputText);
}

export async function readJsonRequest(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export async function handleAuditRequest(req, res, env) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const body = req.body ?? (await readJsonRequest(req));
    const audit = await createRepositoryAudit(body.snapshot, {
      apiKey: env.OPENAI_API_KEY,
      model: env.OPENAI_MODEL,
    });

    sendJson(res, 200, { audit });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Failed to generate repository audit.",
    });
  }
}
