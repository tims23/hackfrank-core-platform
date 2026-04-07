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

    switch (action) {
      case "create": {
        const { name, description, maxMembers } = data as {
          name: string
          description: string
          maxMembers: number
        }

        if (!name || !description || !maxMembers) {
          res.status(400).json({ error: "Missing required fields" })
          return
        }

        const result = await createPendingTeamFromApplication(uid, name, description, maxMembers)
        res.status(200).json(result)
        return
      }

      case "join": {
        const { teamCode } = data as { teamCode: string }

        if (!teamCode) {
          res.status(400).json({ error: "Team code required" })
          return
        }

        const joined = await joinPendingTeamByCode(teamCode, uid)
        res.status(200).json({ joined })
        return
      }

      case "approve-member": {
        const { teamDocId, memberId } = data as { teamDocId: string; memberId: string }

        if (!teamDocId || !memberId) {
          res.status(400).json({ error: "Missing required fields" })
          return
        }

        await approvePendingMember(teamDocId, memberId)
        res.status(200).json({ success: true })
        return
      }

      case "decline-member": {
        const { teamDocId, memberId } = data as { teamDocId: string; memberId: string }

        if (!teamDocId || !memberId) {
          res.status(400).json({ error: "Missing required fields" })
          return
        }

        await declinePendingMember(teamDocId, memberId)
        res.status(200).json({ success: true })
        return
      }

      case "leave": {
        const { teamDocId } = data as { teamDocId: string }

        if (!teamDocId) {
          res.status(400).json({ error: "Team doc ID required" })
          return
        }

        await leavePendingTeam(teamDocId, uid)
        res.status(200).json({ success: true })
        return
      }

      case "kick": {
        const { teamDocId, memberId } = data as { teamDocId: string; memberId: string }

        if (!teamDocId || !memberId) {
          res.status(400).json({ error: "Missing required fields" })
          return
        }

        await kickPendingTeamMember(teamDocId, memberId)
        res.status(200).json({ success: true })
        return
      }

      default:
        res.status(400).json({ error: "Unknown action" })
    }
    return
  }

  res.status(405).json({ error: "Method not allowed" })
})
