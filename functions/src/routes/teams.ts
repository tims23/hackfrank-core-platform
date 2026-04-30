import { Router } from "express"
import type { Response } from "express"
import type { AuthenticatedRequest } from "../middleware/auth.js"
import {
  createPendingTeamFromApplication,
  joinPendingTeamByCode,
  leavePendingTeam,
  kickPendingTeamMember,
  submitPendingTeamApplication,
  SubmittedTeamMutationError,
  TeamSelectionLockedError,
} from "../lib/teams.js"

const router = Router()

router.post("/", async (req, res: Response) => {
  const { uid } = req as AuthenticatedRequest
  const { action, ...data } = req.body as { action: string; [key: string]: unknown }

  console.log("[functions/teams] POST action received", {
    uid,
    action,
    bodyKeys: Object.keys(data ?? {}),
  })

  switch (action) {
    case "create": {
      const { name, description } = data as {
        name: string
        description: string
      }

      if (!name || !description) {
        console.warn("[functions/teams] Create validation failed", {
          uid,
          hasName: Boolean(name),
          hasDescription: Boolean(description),
        })
        res.status(400).json({ error: "Missing required fields" })
        return
      }

      console.log("[functions/teams] Creating team", { uid })
      let result: { teamCode: string }
      try {
        result = await createPendingTeamFromApplication(uid, name, description)
      } catch (error) {
        if (error instanceof TeamSelectionLockedError) {
          console.warn("[functions/teams] Create blocked by applicant team-selection lock", { uid })
          res.status(403).json({ error: error.message })
          return
        }

        throw error
      }
      console.log("[functions/teams] Team created", { uid, teamCode: result.teamCode })
      res.status(200).json(result)
      return
    }

    case "join": {
      const { teamCode } = data as { teamCode: string }

      if (!teamCode) {
        console.warn("[functions/teams] Join validation failed: missing teamCode", { uid })
        res.status(400).json({ error: "Team code required" })
        return
      }

      console.log("[functions/teams] Attempting team join", { uid, teamCode })
      let joined = false
      try {
        joined = await joinPendingTeamByCode(teamCode, uid)
      } catch (error) {
        if (error instanceof TeamSelectionLockedError) {
          console.warn("[functions/teams] Join blocked by applicant team-selection lock", { uid, teamCode })
          res.status(403).json({ error: error.message })
          return
        }

        throw error
      }
      console.log("[functions/teams] Team join result", { uid, teamCode, joined })
      res.status(200).json({ joined })
      return
    }

    case "leave": {
      const { teamDocId } = data as { teamDocId: string }

      if (!teamDocId) {
        console.warn("[functions/teams] leave validation failed: missing teamDocId", { uid })
        res.status(400).json({ error: "Team doc ID required" })
        return
      }

      console.log("[functions/teams] Leaving team", { uid, teamDocId })
      await leavePendingTeam(teamDocId, uid)
      console.log("[functions/teams] Left team", { uid, teamDocId })
      res.status(200).json({ success: true })
      return
    }

    case "kick": {
      const { teamDocId, memberId } = data as { teamDocId: string; memberId: string }

      if (!teamDocId || !memberId) {
        console.warn("[functions/teams] kick validation failed", {
          uid,
          hasTeamDocId: Boolean(teamDocId),
          hasMemberId: Boolean(memberId),
        })
        res.status(400).json({ error: "Missing required fields" })
        return
      }

      console.log("[functions/teams] Kicking team member", { uid, teamDocId, memberId })
      try {
        await kickPendingTeamMember(teamDocId, memberId)
      } catch (error) {
        if (error instanceof SubmittedTeamMutationError) {
          console.warn("[functions/teams] Kick blocked for submitted team", { uid, teamDocId, memberId })
          res.status(403).json({ error: error.message })
          return
        }

        throw error
      }
      console.log("[functions/teams] Team member kicked", { uid, teamDocId, memberId })
      res.status(200).json({ success: true })
      return
    }

    case "submit-application": {
      const { teamDocId } = data as { teamDocId: string }

      if (!teamDocId) {
        console.warn("[functions/teams] submit-application validation failed: missing teamDocId", { uid })
        res.status(400).json({ error: "Team doc ID required" })
        return
      }

      console.log("[functions/teams] Submitting team application", { uid, teamDocId })
      await submitPendingTeamApplication(teamDocId, uid)
      console.log("[functions/teams] Team application submitted", { uid, teamDocId })
      res.status(200).json({ success: true })
      return
    }

    default:
      console.warn("[functions/teams] Unknown action", { uid, action })
      res.status(400).json({ error: "Unknown action" })
  }
})

export default router
