import admin from "firebase-admin"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, "..")
const outputDir = path.join(repoRoot, "firestore-dumps")

const loadFirebaseConfig = async () => {
  if (process.env.FIREBASE_CONFIG) {
    return process.env.FIREBASE_CONFIG
  }

  const envFilePath = path.join(repoRoot, ".env.local")

  try {
    const envFile = await readFile(envFilePath, "utf8")
    const firebaseConfigLine = envFile
      .split(/\r?\n/)
      .find((line) => line.startsWith("FIREBASE_CONFIG="))

    if (!firebaseConfigLine) {
      return null
    }

    return firebaseConfigLine.slice("FIREBASE_CONFIG=".length)
  } catch {
    return null
  }
}

const parseFirebaseConfig = (rawConfig) => {
  const trimmedConfig = rawConfig.trim()
  const unwrappedConfig =
    trimmedConfig.startsWith('"') && trimmedConfig.endsWith('"')
      ? trimmedConfig.slice(1, -1)
      : trimmedConfig

  const extractQuotedField = (fieldName) => {
    const marker = `"${fieldName}": "`
    const startIndex = unwrappedConfig.indexOf(marker)

    if (startIndex === -1) {
      return null
    }

    const valueStartIndex = startIndex + marker.length
    const valueEndIndex = unwrappedConfig.indexOf('"', valueStartIndex)

    if (valueEndIndex === -1) {
      return null
    }

    return unwrappedConfig.slice(valueStartIndex, valueEndIndex)
  }

  const projectId = extractQuotedField("project_id")
  const clientEmail = extractQuotedField("client_email")
  const privateKey = extractQuotedField("private_key")

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Unable to read Firebase service account fields from FIREBASE_CONFIG.")
  }

  return {
    project_id: projectId,
    client_email: clientEmail,
    private_key: privateKey.replace(/\\n/g, "\n"),
  }
}

const initializeAdmin = async () => {
  const rawConfig = await loadFirebaseConfig()

  if (!rawConfig) {
    throw new Error("Missing FIREBASE_CONFIG. Set the env var or keep it in .env.local.")
  }

  const parsedConfig = parseFirebaseConfig(rawConfig)

  const privateKey = String(parsedConfig.private_key ?? "").replace(/\\n/g, "\n")

  if (!parsedConfig.project_id || !parsedConfig.client_email || !privateKey) {
    throw new Error(
      "FIREBASE_CONFIG is missing one or more required fields: project_id, client_email, private_key",
    )
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: parsedConfig.project_id,
        clientEmail: parsedConfig.client_email,
        privateKey,
      }),
      projectId: parsedConfig.project_id,
    })
  }
}

const isTimestampLike = (value) =>
  Boolean(
    value &&
      typeof value === "object" &&
      typeof value.toDate === "function" &&
      typeof value.seconds === "number" &&
      typeof value.nanoseconds === "number",
  )

const isDocumentReferenceLike = (value) =>
  Boolean(
    value &&
      typeof value === "object" &&
      typeof value.path === "string" &&
      typeof value.id === "string" &&
      "parent" in value,
  )

const isGeoPointLike = (value) =>
  Boolean(
    value &&
      typeof value === "object" &&
      typeof value.latitude === "number" &&
      typeof value.longitude === "number",
  )

const serializeValue = (value) => {
  if (value === null || value === undefined) {
    return value
  }

  if (Array.isArray(value)) {
    return value.map((entry) => serializeValue(entry))
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (isTimestampLike(value)) {
    return value.toDate().toISOString()
  }

  if (isDocumentReferenceLike(value)) {
    return value.path
  }

  if (isGeoPointLike(value)) {
    return {
      latitude: value.latitude,
      longitude: value.longitude,
    }
  }

  if (typeof value !== "object") {
    return value
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => [key, serializeValue(entryValue)]),
  )
}

const dumpCollection = async (collectionRef) => {
  const snapshot = await collectionRef.get()
  const documents = snapshot.docs.map((documentSnapshot) => ({
    id: documentSnapshot.id,
    data: serializeValue(documentSnapshot.data()),
  }))

  const payload = {
    collection: collectionRef.id,
    exportedAt: new Date().toISOString(),
    documentCount: documents.length,
    documents,
  }

  const outputPath = path.join(outputDir, `${collectionRef.id}.json`)
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8")

  return {
    collection: collectionRef.id,
    documentCount: documents.length,
    outputPath,
  }
}

const main = async () => {
  await initializeAdmin()
  await mkdir(outputDir, { recursive: true })

  const collections = (await admin.firestore().listCollections()).sort((first, second) =>
    first.id.localeCompare(second.id),
  )

  if (collections.length === 0) {
    console.log("No Firestore collections found.")
    return
  }

  const results = []

  for (const collectionRef of collections) {
    const result = await dumpCollection(collectionRef)
    results.push(result)
    console.log(
      `Wrote ${result.collection} (${result.documentCount} documents) -> ${path.relative(repoRoot, result.outputPath)}`,
    )
  }

  console.log(`Finished exporting ${results.length} collections to ${path.relative(repoRoot, outputDir)}`)
}

main().catch((error) => {
  console.error("Firestore dump failed:", error)
  process.exitCode = 1
})