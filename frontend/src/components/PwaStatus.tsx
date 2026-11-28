import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

type InstallEvent = Event & { prompt: () => Promise<void> }

export default function PwaStatus() {
  const [online, setOnline] = useState(navigator.onLine)
  const [installEvt, setInstallEvt] = useState<InstallEvent | null>(null)
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    const install = (e: Event) => {
      e.preventDefault()
      setInstallEvt(e as InstallEvent)
    }
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    window.addEventListener('beforeinstallprompt', install)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
      window.removeEventListener('beforeinstallprompt', install)
    }
  }, [])

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className={`rounded-full px-2 py-0.5 ${online ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
        {online ? 'Online' : 'Offline'}
      </span>
      {installEvt && (
        <button
          className="rounded bg-indigo-600 px-2 py-0.5 text-white"
          onClick={() => installEvt.prompt().then(() => setInstallEvt(null))}
        >
          Instalar app
        </button>
      )}
      {needRefresh && (
        <button className="rounded bg-indigo-600 px-2 py-0.5 text-white" onClick={() => updateServiceWorker(true)}>
          Nova versão — atualizar
        </button>
      )}
    </div>
  )
}
