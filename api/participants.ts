import type { VercelRequest, VercelResponse } from "@vercel/node"
import { withAuth } from "./lib/auth-middleware.ts"
import { fetchParticipantProfileForSharedTeam } from "./lib/participants.ts"

export default withAuth(async (req: VercelRequest, res: VercelResponse, requesterUid: string) => {
  if (req.method !== "GET") {
    console.warn("[api/participants] Method not allowed", { uid: requesterUid, method: req.method })
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const targetUidRaw = req.query.uid
  const targetUid = typeof targetUidRaw === "string" ? targetUidRaw.trim() : ""

  if (!targetUid) {
    console.warn("[api/participants] Missing uid query parameter", { requesterUid })
    res.status(400).json({ error: "Missing required query parameter: uid" })
    return
  }

  console.log("[api/participants] Fetching shared participant profile", {
    requesterUid,
    targetUid,
  })

  const profile = await fetchParticipantProfileForSharedTeam(requesterUid, targetUid)
  if (!profile) {
    console.warn("[api/participants] Access denied or participant not found", {
      requesterUid,
      targetUid,
    })
    res.status(403).json({ error: "Forbidden" })
    return
  }

  res.status(200).json({ success: true, profile })
})