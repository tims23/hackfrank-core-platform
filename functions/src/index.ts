import { onRequest } from "firebase-functions/v2/https"
import express from "express"
import cors from "cors"
import { authMiddleware } from "./middleware/auth.js"
import applicantsRouter from "./routes/applicants.js"
import participantsRouter from "./routes/participants.js"
import teamsRouter from "./routes/teams.js"

const app = express()

// Parse JSON request bodies.
app.use(express.json())

// Enable CORS for all origins (Firebase Auth tokens are verified server-side).
app.use(cors({ origin: true }))

// All routes require authentication.
app.use(authMiddleware)

// Mount route handlers matching the original /api/* Vercel paths.
app.use("/applicants", applicantsRouter)
app.use("/participants", participantsRouter)
app.use("/teams", teamsRouter)

// Global error handler.
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[functions] Unhandled error", {
    message: err.message,
    stack: err.stack,
  })
  res.status(500).json({
    error: err.message || "Internal server error",
  })
})

/**
 * Cloud Functions v2 HTTP function.
 *
 * Deployed to europe-west1 to co-locate with Firestore (eur3).
 * Exposed as: https://<region>-<project>.cloudfunctions.net/api
 *
 * The frontend calls:
 *   /api/applicants  → applicantsRouter
 *   /api/participants → participantsRouter
 *   /api/teams       → teamsRouter
 *
 * Note: Cloud Functions strips the function name prefix from req.path,
 * so the Express router sees /applicants, /participants, /teams directly.
 */
export const api = onRequest(
  {
    region: "europe-west1",
    // Increase memory/timeout for Firestore transaction-heavy routes.
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  app,
)
