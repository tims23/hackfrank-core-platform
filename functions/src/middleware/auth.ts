import type { Request, Response, NextFunction } from "express"
import { auth } from "../lib/firebase-admin.js"

export async function verifyAuthToken(
  req: Request,
): Promise<{ uid: string } | null> {
  const authHeader = req.headers.authorization
  const requestPath = req.originalUrl ?? "unknown"

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("[functions/auth] Missing or invalid authorization header", {
      method: req.method,
      path: requestPath,
    })
    return null
  }

  const token = authHeader.slice(7)

  try {
    const decodedToken = await auth.verifyIdToken(token)
    console.log("[functions/auth] Token verified", {
      method: req.method,
      path: requestPath,
      uid: decodedToken.uid,
    })
    return { uid: decodedToken.uid }
  } catch (error) {
    console.error("[functions/auth] verifyAuthToken failed", {
      method: req.method,
      path: requestPath,
      message: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

/**
 * Express middleware that verifies the Firebase Auth Bearer token
 * and attaches `req.uid` for downstream route handlers.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  console.log("[functions] Incoming request", {
    method: req.method,
    path: req.originalUrl,
  })

  const result = await verifyAuthToken(req)

  if (!result) {
    console.warn("[functions] Unauthorized request rejected", {
      method: req.method,
      path: req.originalUrl,
    })
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  // Attach uid to the request for downstream handlers.
  ;(req as AuthenticatedRequest).uid = result.uid
  next()
}

/**
 * Express Request augmented with the authenticated user's UID.
 */
export interface AuthenticatedRequest extends Request {
  uid: string
}
