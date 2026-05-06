import { handleAuditRequest } from "../server/openaiAudit.js";

export default async function handler(req, res) {
  await handleAuditRequest(req, res, process.env);
}
