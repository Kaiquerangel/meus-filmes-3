import { useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth'
import {
  doc, getDoc, setDoc,
  getDocs, collection, query, where,
  serverTimestamp
} from 'firebase/firestore'
import { auth, db } from './firebase'
import { useAppStore } from '../store/useAppStore'

const googleProvider = new GoogleAuthProvider()

export function useAuth() {
  const { setUser, setUserProfile, setCarregando } = useAppStore()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (snap.exists()) {
            setUserProfile(snap.data())
          }
        } catch (e) {
          console.error('Erro ao buscar perfil:', e)
        }
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setCarregando(false)
    })

    return () => unsub()
  }, [])

  const login = async (identifier, password, lembrar = true) => {
    let email = identifier.trim()

    // Login por nickname — resolve para email antes de autenticar
    if (!email.includes('@') || email.startsWith('@')) {
      const nick = email.replace('@', '').toLowerCase()
      const q = query(collection(db, 'users'), where('nickname_lower', '==', nick))
      const snap = await getDocs(q)
      if (snap.empty) throw new Error('Usuário não encontrado.')
      email = snap.docs[0].data().email
    }

    // "Lembrar de mim" marcado → sessão persiste após fechar o navegador.
    // Desmarcado → sessão é limpa ao fechar a aba/navegador.
    await setPersistence(auth, lembrar ? browserLocalPersistence : browserSessionPersistence)

    return signInWithEmailAndPassword(auth, email, password)
  }

  const loginComGoogle = async () => {
    // Login social sempre persiste — é o padrão esperado desse fluxo
    await setPersistence(auth, browserLocalPersistence)
    const cred = await signInWithPopup(auth, googleProvider)
    const user = cred.user

    // Verifica se perfil já existe — se não, cria automaticamente
    const snap = await getDoc(doc(db, 'users', user.uid))
    if (!snap.exists()) {
      // Gera nickname a partir do displayName ou email
      const baseNick = (user.displayName || user.email.split('@')[0])
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 20)

      // Garante que o nickname não está em uso
      let nickname = baseNick
      let tentativa = 0
      while (true) {
        const q = query(collection(db, 'users'), where('nickname_lower', '==', nickname))
        const s = await getDocs(q)
        if (s.empty) break
        tentativa++
        nickname = `${baseNick}${tentativa}`
      }

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        nome: user.displayName || 'Usuário',
        nickname,
        nickname_lower: nickname,
        email: user.email,
        foto: user.photoURL || null,
        publico: true,
        membroDesde: serverTimestamp(),
      })
    } else {
      setUserProfile(snap.data())
    }

    return cred.user
  }

  const logout = () => signOut(auth)

  const register = async (nome, nickname, email, password) => {
    const nick = nickname.toLowerCase().trim().replace(/[^a-z0-9_]/g, '')
    if (!nick) throw new Error('Nickname inválido. Use letras, números ou _.')

    const q = query(collection(db, 'users'), where('nickname_lower', '==', nick))
    const snap = await getDocs(q)
    if (!snap.empty) throw new Error('Nickname já está em uso.')

    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      nome: nome.trim(),
      nickname: nick,
      nickname_lower: nick,
      email,
      publico: true,
      membroDesde: serverTimestamp(),
    })
    return cred.user
  }

  const recoverPassword = (email) => sendPasswordResetEmail(auth, email.trim())

  return { login, loginComGoogle, logout, register, recoverPassword }
}
