import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PwaStatus from './components/PwaStatus'
import TasksPage from './pages/TasksPage'
import { startSync } from './sync/sync'

const queryClient = new QueryClient()

export default function App() {
  useEffect(() => startSync(), [])
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <main className="mx-auto max-w-xl p-4">
          <header className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Tarefas</h1>
            <PwaStatus />
          </header>
          <Routes>
            <Route path="/" element={<TasksPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
