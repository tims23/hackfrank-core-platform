import { Router } from "express"
import type { Response } from "express"
import type { AuthenticatedRequest } from "../middleware/auth.js"
import {
  fetchApplicantFormData,
  submitApplicantForm,
  syncApplicantDraft,
  createApplicant,
  type ApplicantFormInput,
} from "../lib/applicants.js"

const router = Router()

router.get("/", async (req, res: Response) => {
  const { uid } = req as AuthenticatedRequest
  console.log("[functions/applicants] GET request received", { uid })

  const application = await fetchApplicantFormData(uid)

  res.status(200).json({
    success: true,
    application,
  })
})

router.post("/", async (req, res: Response) => {
  const { uid } = req as AuthenticatedRequest
  const { action, ...data } = req.body as { action: string; [key: string]: unknown }

  console.log("[functions/applicants] POST action received", {
    uid,
    action,
    bodyKeys: Object.keys(data ?? {}),
  })

  switch (action) {
    case "create": {
      console.log("[functions/applicants] Creating applicant", { uid })
      await createApplicant(uid)
      console.log("[functions/applicants] Applicant created", { uid })
      res.status(200).json({ success: true })
      return
    }

    case "submit": {
      const applicant = data as unknown as ApplicantFormInput

      if (!applicant.prename || !applicant.surname) {
        console.warn("[functions/applicants] Submit validation failed", {
          uid,
          hasPrename: Boolean(applicant.prename),
          hasSurname: Boolean(applicant.surname),
        })
        res.status(400).json({ error: "Missing required fields" })
        return
      }

      console.log("[functions/applicants] Submitting applicant form", { uid })
      await submitApplicantForm(uid, applicant)
      console.log("[functions/applicants] Applicant form submitted", { uid })
      res.status(200).json({ success: true })
      return
    }

    case "sync-draft": {
      const updates = data as unknown as Partial<ApplicantFormInput>

      if (Object.keys(updates).length === 0) {
        console.warn("[functions/applicants] sync-draft rejected: empty updates", { uid })
        res.status(400).json({ error: "No updates provided" })
        return
      }

      console.log("[functions/applicants] Syncing applicant draft", {
        uid,
        updateKeys: Object.keys(updates),
      })
      await syncApplicantDraft(uid, updates)
      console.log("[functions/applicants] Applicant draft synced", { uid })
      res.status(200).json({ success: true })
      return
    }

    default:
      console.warn("[functions/applicants] Unknown action", { uid, action })
      res.status(400).json({ error: "Unknown action" })
  }
})

export default router
