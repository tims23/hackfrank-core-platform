import type { VercelRequest, VercelResponse } from "@vercel/node"
import { withAuth } from "./lib/auth-middleware.ts"
import {
  fetchApplicantFormData,
  submitApplicantForm,
  syncApplicantDraft,
  createApplicant,
  type ApplicantFormInput,
} from "./lib/applicants.ts"

export default withAuth(async (req: VercelRequest, res: VercelResponse, uid: string) => {
  if (req.method === "GET") {
    console.log("[api/applicants] GET request received", { uid })

    const application = await fetchApplicantFormData(uid)

    res.status(200).json({
      success: true,
      application,
    })
    return
  }

  if (req.method === "POST") {
    const { action, ...data } = req.body
    console.log("[api/applicants] POST action received", {
      uid,
      action,
      bodyKeys: Object.keys(data ?? {}),
    })

    switch (action) {
      case "create": {
        console.log("[api/applicants] Creating applicant", { uid })
        await createApplicant(uid)
        console.log("[api/applicants] Applicant created", { uid })
        res.status(200).json({ success: true })
        return
      }

      case "submit": {
        const applicant = data as ApplicantFormInput

        if (!applicant.prename || !applicant.surname) {
          console.warn("[api/applicants] Submit validation failed", {
            uid,
            hasPrename: Boolean(applicant.prename),
            hasSurname: Boolean(applicant.surname),
          })
          res.status(400).json({ error: "Missing required fields" })
          return
        }

        console.log("[api/applicants] Submitting applicant form", { uid })
        await submitApplicantForm(uid, applicant)
        console.log("[api/applicants] Applicant form submitted", { uid })
        res.status(200).json({ success: true })
        return
      }

      case "sync-draft": {
        const updates = data as Partial<ApplicantFormInput>

        if (Object.keys(updates).length === 0) {
          console.warn("[api/applicants] sync-draft rejected: empty updates", { uid })
          res.status(400).json({ error: "No updates provided" })
          return
        }

        console.log("[api/applicants] Syncing applicant draft", {
          uid,
          updateKeys: Object.keys(updates),
        })
        await syncApplicantDraft(uid, updates)
        console.log("[api/applicants] Applicant draft synced", { uid })
        res.status(200).json({ success: true })
        return
      }

      default:
        console.warn("[api/applicants] Unknown action", { uid, action })
        res.status(400).json({ error: "Unknown action" })
    }
    return
  }

  console.warn("[api/applicants] Method not allowed", { uid, method: req.method })
  res.status(405).json({ error: "Method not allowed" })
})
