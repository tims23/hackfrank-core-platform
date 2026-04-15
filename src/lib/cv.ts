import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { firebaseStorage, logFirebaseFetch } from "@/lib/firebase"

const sanitizeFileName = (fileName: string): string => {
  const normalized = fileName.trim().toLowerCase()
  const withSafeChars = normalized.replace(/[^a-z0-9._-]/g, "-")
  const compacted = withSafeChars.replace(/-+/g, "-")
  return compacted.length > 0 ? compacted : "cv.pdf"
}

const isPdfFile = (file: File): boolean => {
  if (file.type === "application/pdf") {
    return true
  }

  return file.name.trim().toLowerCase().endsWith(".pdf")
}

export const uploadApplicantCv = async (
  uid: string,
  cvFile: File,
): Promise<{ downloadUrl: string; storagePath: string }> => {
  const normalizedUid = uid.trim()
  if (!normalizedUid) {
    throw new Error("Could not determine the current user for CV upload.")
  }

  if (!isPdfFile(cvFile)) {
    throw new Error("Please upload a PDF file.")
  }

  const safeFileName = sanitizeFileName(cvFile.name)
  const storagePath = `CV/${normalizedUid}/${Date.now()}-${safeFileName}`

  logFirebaseFetch("storage:write:start", {
    folder: "CV",
    path: storagePath,
    size: cvFile.size,
    type: cvFile.type || "unknown",
  })

  const cvRef = ref(firebaseStorage, storagePath)
  await uploadBytes(cvRef, cvFile, {
    contentType: "application/pdf",
  })
  const downloadUrl = await getDownloadURL(cvRef)

  logFirebaseFetch("storage:write:success", {
    folder: "CV",
    path: storagePath,
  })

  return {
    downloadUrl,
    storagePath,
  }
}

export const deleteApplicantCvByUrl = async (cvUrl: string): Promise<boolean> => {
  const normalizedUrl = cvUrl.trim()
  if (!normalizedUrl) {
    return false
  }

  try {
    const parsedUrl = new URL(normalizedUrl)
    const gsPathMatch = normalizedUrl.match(/^gs:\/\/[^/]+\/(.+)$/)
    const objectPathFromGs = gsPathMatch?.[1]?.trim() ?? ""
    const objectPathFromDownloadUrl = (() => {
      const encodedObjectPath = parsedUrl.pathname.split("/o/")[1]
      if (!encodedObjectPath) {
        return ""
      }

      return decodeURIComponent(encodedObjectPath).trim()
    })()
    const objectPath = objectPathFromGs || objectPathFromDownloadUrl

    if (!objectPath || !objectPath.startsWith("CV/")) {
      logFirebaseFetch("storage:delete:skipped", {
        url: normalizedUrl,
        reason: "invalid-cv-path",
      })
      return false
    }

    const cvRef = ref(firebaseStorage, objectPath)

    logFirebaseFetch("storage:delete:start", {
      url: normalizedUrl,
      path: objectPath,
    })

    await deleteObject(cvRef)

    logFirebaseFetch("storage:delete:success", {
      url: normalizedUrl,
      path: objectPath,
    })

    return true
  } catch (error) {
    logFirebaseFetch("storage:delete:error", {
      url: normalizedUrl,
      message: error instanceof Error ? error.message : String(error),
    })
    return false
  }
}

export const getCvFileNameFromUrl = (cvUrl: string): string => {
  const normalizedUrl = cvUrl.trim()
  if (!normalizedUrl) {
    return ""
  }

  try {
    const parsedUrl = new URL(normalizedUrl)
    const decodedPath = decodeURIComponent(parsedUrl.pathname)
    const rawFileName = decodedPath.split("/").pop() ?? ""
    const normalizedFileName = rawFileName.replace(/^\d+-/, "").trim()
    return normalizedFileName
  } catch {
    const fallbackFileName = normalizedUrl.split("/").pop()?.split("?")[0] ?? ""
    return decodeURIComponent(fallbackFileName).replace(/^\d+-/, "").trim()
  }
}
