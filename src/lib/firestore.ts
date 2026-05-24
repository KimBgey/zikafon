import { db } from './firebase'
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore'
import { Track, MoodAnalysis } from '@/types'

// ── Collection paths ───────────────────────────────────────────────────────────
// All Zikafon collections are prefixed with "zikafon_" to avoid conflicts in
// shared Firebase projects.

const USERS        = 'zikafon_users'
const LIKED_TRACKS = 'zikafon_likedTracks'
const SESSIONS     = 'zikafon_moodSessions'

// ── User document ─────────────────────────────────────────────────────────────

export interface UserDoc {
  displayName: string
  email: string
  photoURL?: string
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export async function createUserDoc(
  uid: string,
  data: { displayName: string; email: string; photoURL?: string }
) {
  const ref = doc(db, USERS, uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
}

export async function getUserDoc(uid: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, USERS, uid))
  return snap.exists() ? (snap.data() as UserDoc) : null
}

export async function updateUserDoc(uid: string, data: Record<string, unknown>) {
  const ref = doc(db, USERS, uid)
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
}

export async function deleteUserAccount(uid: string) {
  // Deletes the top-level user doc.
  // Subcollection cleanup should be handled via Cloud Functions (client SDK can't bulk-delete).
  await deleteDoc(doc(db, USERS, uid))
}

// ── Liked tracks ──────────────────────────────────────────────────────────────

export interface LikedTrackDoc {
  trackId: string
  title: string
  artist: string
  cover: string
  deezerUrl: string
  likedAt: Timestamp | null
  moodContext: string
}

export async function saveLikedTrack(
  uid: string,
  track: Track,
  moodContext = ''
) {
  const ref = doc(db, USERS, uid, LIKED_TRACKS, track.id)
  await setDoc(
    ref,
    {
      trackId: track.id,
      title: track.name,
      artist: track.artists[0] ?? '',
      cover: track.albumCover ?? '',
      deezerUrl: track.spotifyUrl, // field kept for compat; actual value is Deezer link
      likedAt: serverTimestamp(),
      moodContext,
    },
    { merge: true }
  )
}

export async function removeLikedTrack(uid: string, trackId: string) {
  await deleteDoc(doc(db, USERS, uid, LIKED_TRACKS, trackId))
}

export async function getLikedTracks(
  uid: string,
  maxItems = 50
): Promise<LikedTrackDoc[]> {
  const q = query(
    collection(db, USERS, uid, LIKED_TRACKS),
    orderBy('likedAt', 'desc'),
    limit(maxItems)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as LikedTrackDoc)
}

// ── Mood sessions ─────────────────────────────────────────────────────────────

export interface MoodSessionDoc {
  sessionId: string
  moodText: string
  keywords: string[]
  genres: string[]
  energy: number
  valence: number
  tempo: string
  tracks: {
    id: string
    name: string
    artists: string[]
    albumCover: string
    spotifyUrl: string
  }[]
  likedTrackIds: string[]
  skippedTrackIds: string[]
  createdAt: Timestamp | null
}

export async function saveSession(
  uid: string,
  mood: MoodAnalysis,
  tracks: Track[],
  liked: string[],
  skipped: string[]
): Promise<string> {
  const sessionId = `${Date.now()}`
  const ref = doc(db, USERS, uid, SESSIONS, sessionId)

  const tracksLite = tracks.map((t) => ({
    id: t.id,
    name: t.name,
    artists: t.artists,
    albumCover: t.albumCover ?? '',
    spotifyUrl: t.spotifyUrl,
  }))

  await setDoc(ref, {
    sessionId,
    moodText: mood.raw,
    keywords: mood.keywords,
    genres: mood.genres,
    energy: mood.energy,
    valence: mood.valence,
    tempo: mood.tempo,
    tracks: tracksLite,
    likedTrackIds: liked,
    skippedTrackIds: skipped,
    createdAt: serverTimestamp(),
  })

  return sessionId
}

export async function getSessions(
  uid: string,
  maxItems = 20
): Promise<MoodSessionDoc[]> {
  const q = query(
    collection(db, USERS, uid, SESSIONS),
    orderBy('createdAt', 'desc'),
    limit(maxItems)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as MoodSessionDoc)
}
