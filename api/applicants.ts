import type { VercelRequest, VercelResponse } from "@vercel/node"
import { withAuth } from "./lib/auth-middleware.ts"
import { submitApplicantForm, syncApplicantDraft, createApplicant, type ApplicantFormInput } from "./lib/applicants.ts"

export default withAuth(async (req: VercelRequest, res: VercelResponse, uid: string) => {
  if (req.method === "POST") {
    const { action, ...data } = req.body

    switch (action) {
      case "create": {
        await createApplicant(uid)
        res.status(200).json({ success: true })
        return
      }

      case "submit": {
        const applicant = data as ApplicantFormInput

        if (!applicant.prename || !applicant.surname) {
          res.status(400).json({ error: "Missing required fields" })
          return
        }

        await submitApplicantForm(uid, applicant)
        res.status(200).json({ success: true })
        return
      }

      case "sync-draft": {
        const updates = data as Partial<ApplicantFormInput>

        if (Object.keys(updates).length === 0) {
          res.status(400).json({ error: "No updates provided" })
          return
        }

        await syncApplicantDraft(uid, updates)
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
