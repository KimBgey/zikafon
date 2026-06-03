import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialise once across hot-reloads
const app = getApps().length === 0
  ? initializeApp({
      credential: cert(
        JSON.parse(process.env.FIREBASE_ADMIN_KEY!) as Parameters<typeof cert>[0]
      ),
    })
  : getApps()[0]

export const adminDb = getFirestore(app)
