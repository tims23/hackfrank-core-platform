# Copilot Instructions

- During debugging, add or preserve console logs for all Firebase fetch/listener operations in frontend code (`getDoc`, `getDocs`, `onSnapshot`) so network/data activity is visible in the browser console.
- Use the shared logger from `frontend/src/lib/firebase.ts` (`logFirebaseFetch`) instead of ad-hoc log formats.
- Keep Firebase debug logs enabled in development by default; optionally allow explicit override with `VITE_FIREBASE_DEBUG_LOGS=true`.
