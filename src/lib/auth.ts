import type { User } from 'firebase/auth'
import { browserLocalPersistence, onAuthStateChanged, setPersistence, signInAnonymously } from 'firebase/auth'
import { auth } from './firebase'

let inflight: Promise<User> | null = null

/**
 * Garantiza que haya un usuario autenticado (anonymous) para cumplir con
 * Firestore Rules del tipo: `request.auth != null`.
 */
export function ensureAnonymousAuth(): Promise<User> {
  if (inflight) return inflight

  inflight = (async () => {
    // Persistencia para que no se pierda el user entre refreshes.
    // Si falla (por políticas del browser), seguimos igual.
    await setPersistence(auth, browserLocalPersistence).catch(() => {})

    return new Promise<User>((resolve, reject) => {
      let done = false
      const unsub = onAuthStateChanged(auth, async (u) => {
        if (done) return

        if (u) {
          done = true
          unsub()
          resolve(u)
          return
        }

        try {
          const cred = await signInAnonymously(auth)
          done = true
          unsub()
          resolve(cred.user)
        } catch (err) {
          done = true
          unsub()
          reject(err)
        }
      })
    })
  })()

  return inflight
}
