import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { WikiEntry } from '@/lib/types'

function entriesRef(userId: string) {
  return collection(db, 'vibecoding_entries', userId, 'entries')
}

export function subscribeEntries(
  userId: string,
  callback: (entries: WikiEntry[]) => void
): Unsubscribe {
  const q = query(entriesRef(userId))
  return onSnapshot(q, (snapshot) => {
    const entries: WikiEntry[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<WikiEntry, 'id'>),
    }))
    callback(entries)
  })
}

export async function addEntry(
  userId: string,
  title: string,
  content: string,
  parentId?: string | null
): Promise<void> {
  const now = Date.now()
  await addDoc(entriesRef(userId), { title, content, parentId: parentId || null, createdAt: now, updatedAt: now })
}

export async function updateEntry(
  userId: string,
  id: string,
  title: string,
  content: string,
  parentId?: string | null
): Promise<void> {
  await updateDoc(doc(db, 'vibecoding_entries', userId, 'entries', id), {
    title,
    content,
    parentId: parentId || null,
    updatedAt: Date.now(),
  })
}

export async function deleteEntry(userId: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'vibecoding_entries', userId, 'entries', id))
}

const DUMMY_ENTRIES = [
  {
    title: 'React useEffect 의존성 배열 규칙',
    content:
      '빈 배열 []은 마운트 시 1회만 실행된다. 값이 있으면 해당 값이 변경될 때마다 재실행되고, 배열을 생략하면 매 렌더링마다 실행된다. ESLint의 exhaustive-deps 규칙을 항상 따르는 것이 안전하다.',
  },
  {
    title: 'TypeScript satisfies 연산자',
    content:
      'satisfies는 값을 특정 타입으로 검증하면서도 추론된 타입을 넓히지 않는다. as와 달리 타입 안전성을 유지하고, 리터럴 타입 추론이 그대로 보존된다. TS 4.9에서 도입됐다.',
  },
  {
    title: 'Vite 환경변수 사용법',
    content:
      'VITE_ 접두사를 붙인 변수만 클라이언트 번들에 노출된다. import.meta.env.VITE_KEY 형태로 접근하며, .env.local 파일은 .gitignore에 반드시 포함해야 한다.',
  },
  {
    title: 'Firestore 보안 규칙 기본 패턴',
    content:
      'request.auth != null 조건으로 인증된 사용자만 접근을 허용한다. request.auth.uid == userId 패턴으로 본인 데이터만 읽기/쓰기 가능하도록 격리할 수 있다.',
  },
  {
    title: 'localeCompare로 한글 정렬',
    content:
      "JavaScript의 기본 sort()는 유니코드 코드포인트 기준이라 한글 정렬이 부정확하다. a.localeCompare(b, 'ko')를 사용하면 한글과 영문이 혼합된 목록도 사전순으로 올바르게 정렬된다.",
  },
]

export async function seedDummyEntries(userId: string): Promise<void> {
  const now = Date.now()
  await Promise.all(
    DUMMY_ENTRIES.map((entry, i) =>
      addDoc(entriesRef(userId), {
        ...entry,
        createdAt: now - i * 60000,
        updatedAt: now - i * 60000,
      })
    )
  )
}
