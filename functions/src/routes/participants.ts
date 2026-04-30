import { Router } from "express"
import type { Response } from "express"
import type { AuthenticatedRequest } from "../middleware/auth.js"
import { fetchParticipantProfileForSharedTeam } from "../lib/participants.js"

const router = Router()

router.get("/", async (req, res: Response) => {
  const { uid: requesterUid } = req as AuthenticatedRequest

  const targetUidRaw = req.query.uid
  const targetUid = typeof targetUidRaw === "string" ? targetUidRaw.trim() : ""

  if (!targetUid) {
    console.warn("[functions/participants] Missing uid query parameter", { requesterUid })
    res.status(400).json({ error: "Missing required query parameter: uid" })
    return
  }

  console.log("[functions/participants] Fetching shared participant profile", {
    requesterUid,
    targetUid,
  })

  const profile = await fetchParticipantProfileForSharedTeam(requesterUid, targetUid)
  if (!profile) {
    console.warn("[functions/participants] Access denied or participant not found", {
      requesterUid,
      targetUid,
    })
    res.status(403).json({ error: "Forbidden" })
    return
  }

  res.status(200).json({ success: true, profile })
})

export default router
