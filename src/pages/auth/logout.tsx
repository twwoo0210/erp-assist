import { useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function LogoutPage() {
  const { signOut } = useAuth()

  useEffect(() => {
    (async () => {
      try {
        await signOut()
      } catch (e) {
        // ignore
      } finally {
        const base = (typeof __BASE_PATH__ !== 'undefined' ? __BASE_PATH__ : '/')
        const normalizedBase = base.endsWith('/') ? base : `${base}/`
        const target = `${window.location.origin}${normalizedBase}auth/login?nocache=${Date.now()}`
        window.location.replace(target)
      }
    })()
  }, [signOut])

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      로그아웃 처리 중…
    </div>
  )
}

