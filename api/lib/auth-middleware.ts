import type { VercelRequest, VercelResponse } from "@vercel/node"
import { auth } from "./firebase-admin.ts"

export async function verifyAuthToken(
  req: VercelRequest,
): Promise<{ uid: string } | null> {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.slice(7)

  try {
    const decodedToken = await auth.verifyIdToken(token)
    return { uid: decodedToken.uid }
  } catch (error) {
    console.error("verifyAuthToken failed", {
      message: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

export function withAuth(
  handler: (req: VercelRequest, res: VercelResponse, uid: string) => Promise<void> | void,
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const auth = await verifyAuthToken(req)

    if (!auth) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    try {
      await handler(req, res, auth.uid)
    } catch (error) {
      console.error("API error:", error)
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      })
    }
  }
}
