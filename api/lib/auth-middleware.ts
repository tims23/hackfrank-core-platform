import type { VercelRequest, VercelResponse } from "@vercel/node"
import { auth } from "./firebase-admin.ts"

function applyCorsHeaders(req: VercelRequest, res: VercelResponse): void {
  const requestOrigin = req.headers.origin

  // Reflect requesting origin in dev to support authenticated cross-origin API calls.
  if (typeof requestOrigin === "string" && requestOrigin.length > 0) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin)
    res.setHeader("Vary", "Origin")
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*")
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type")
}

export async function verifyAuthToken(
  req: VercelRequest,
): Promise<{ uid: string } | null> {
  const authHeader = req.headers.authorization
  const requestPath = req.url ?? "unknown"

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("[api/auth] Missing or invalid authorization header", {
      method: req.method,
      path: requestPath,
    })
    return null
  }

  const token = authHeader.slice(7)

  try {
    const decodedToken = await auth.verifyIdToken(token)
    console.log("[api/auth] Token verified", {
      method: req.method,
      path: requestPath,
      uid: decodedToken.uid,
    })
    return { uid: decodedToken.uid }
  } catch (error) {
    console.error("[api/auth] verifyAuthToken failed", {
      method: req.method,
      path: requestPath,
      message: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

export function withAuth(
  handler: (req: VercelRequest, res: VercelResponse, uid: string) => Promise<void> | void,
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    applyCorsHeaders(req, res)

    if (req.method === "OPTIONS") {
      res.status(204).end()
      return
    }

    console.log("[api] Incoming request", {
      method: req.method,
      path: req.url,
    })

    const auth = await verifyAuthToken(req)

    if (!auth) {
      console.warn("[api] Unauthorized request rejected", {
        method: req.method,
        path: req.url,
      })
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    try {
      await handler(req, res, auth.uid)
      console.log("[api] Request handled successfully", {
        method: req.method,
        path: req.url,
        uid: auth.uid,
      })
    } catch (error) {
      console.error("[api] Request failed", {
        method: req.method,
        path: req.url,
        uid: auth.uid,
        message: error instanceof Error ? error.message : String(error),
      })
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      })
    }
  }
}
