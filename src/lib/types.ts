import type { User } from 'firebase/auth'

export interface AuthContextValue {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

export interface WikiEntry {
  id: string
  title: string
  content: string
  parentId?: string | null
  createdAt: number
  updatedAt: number
}
