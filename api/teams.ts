import type { VercelRequest, VercelResponse } from "@vercel/node"
import { withAuth } from "./lib/auth-middleware.ts"
import {
  createPendingTeamFromApplication,
  joinPendingTeamByCode,
  approvePendingMember,
  declinePendingMember,
  leavePendingTeam,
  kickPendingTeamMember,
} from "./lib/teams.ts"

export default withAuth(async (req: VercelRequest, res: VercelResponse, uid: string) => {
  if (req.method === "POST") {
    const { action, ...data } = req.body
    console.log("[api/teams] POST action received", {
      uid,
      action,
      bodyKeys: Object.keys(data ?? {}),
    })

    switch (action) {
      case "create": {
        const { name, description, maxMembers } = data as {
          name: string
          description: string
          maxMembers: number
        }

        if (!name || !description || !maxMembers) {
          console.warn("[api/teams] Create validation failed", {
            uid,
            hasName: Boolean(name),
            hasDescription: Boolean(description),
            hasMaxMembers: Boolean(maxMembers),
          })
          res.status(400).json({ error: "Missing required fields" })
          return
        }

        console.log("[api/teams] Creating pending team", { uid, maxMembers })
        const result = await createPendingTeamFromApplication(uid, name, description, maxMembers)
        console.log("[api/teams] Pending team created", { uid, teamCode: result.teamCode })
        res.status(200).json(result)
        return
      }

      case "join": {
        const { teamCode } = data as { teamCode: string }

        if (!teamCode) {
          console.warn("[api/teams] Join validation failed: missing teamCode", { uid })
          res.status(400).json({ error: "Team code required" })
          return
        }

        console.log("[api/teams] Attempting team join", { uid, teamCode })
        const joined = await joinPendingTeamByCode(teamCode, uid)
        console.log("[api/teams] Team join result", { uid, teamCode, joined })
        res.status(200).json({ joined })
        return
      }

      case "approve-member": {
        const { teamDocId, memberId } = data as { teamDocId: string; memberId: string }

        if (!teamDocId || !memberId) {
          console.warn("[api/teams] approve-member validation failed", {
            uid,
            hasTeamDocId: Boolean(teamDocId),
            hasMemberId: Boolean(memberId),
          })
          res.status(400).json({ error: "Missing required fields" })
          return
        }

        console.log("[api/teams] Approving pending member", { uid, teamDocId, memberId })
        await approvePendingMember(teamDocId, memberId)
        console.log("[api/teams] Pending member approved", { uid, teamDocId, memberId })
        res.status(200).json({ success: true })
        return
      }

      case "decline-member": {
        const { teamDocId, memberId } = data as { teamDocId: string; memberId: string }

        if (!teamDocId || !memberId) {
          console.warn("[api/teams] decline-member validation failed", {
            uid,
            hasTeamDocId: Boolean(teamDocId),
            hasMemberId: Boolean(memberId),
          })
          res.status(400).json({ error: "Missing required fields" })
          return
        }

        console.log("[api/teams] Declining pending member", { uid, teamDocId, memberId })
        await declinePendingMember(teamDocId, memberId)
        console.log("[api/teams] Pending member declined", { uid, teamDocId, memberId })
        res.status(200).json({ success: true })
        return
      }

      case "leave": {
        const { teamDocId } = data as { teamDocId: string }

        if (!teamDocId) {
          console.warn("[api/teams] leave validation failed: missing teamDocId", { uid })
          res.status(400).json({ error: "Team doc ID required" })
          return
        }

        console.log("[api/teams] Leaving pending team", { uid, teamDocId })
        await leavePendingTeam(teamDocId, uid)
        console.log("[api/teams] Left pending team", { uid, teamDocId })
        res.status(200).json({ success: true })
        return
      }

      case "kick": {
        const { teamDocId, memberId } = data as { teamDocId: string; memberId: string }

        if (!teamDocId || !memberId) {
          console.warn("[api/teams] kick validation failed", {
            uid,
            hasTeamDocId: Boolean(teamDocId),
            hasMemberId: Boolean(memberId),
          })
          res.status(400).json({ error: "Missing required fields" })
          return
        }

        console.log("[api/teams] Kicking team member", { uid, teamDocId, memberId })
        await kickPendingTeamMember(teamDocId, memberId)
        console.log("[api/teams] Team member kicked", { uid, teamDocId, memberId })
        res.status(200).json({ success: true })
        return
      }

      default:
        console.warn("[api/teams] Unknown action", { uid, action })
        res.status(400).json({ error: "Unknown action" })
    }
    return
  }

  console.warn("[api/teams] Method not allowed", { uid, method: req.method })
  res.status(405).json({ error: "Method not allowed" })
})
