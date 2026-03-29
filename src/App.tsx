import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Toaster } from 'sonner'

import { useAuth } from '@/hooks/useAuth'
import { BoardPage } from '@/pages/BoardPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
})

function AuthGate() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3 bg-bg">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-sm text-muted">Setting up your workspace...</p>
      </div>
    )
  }

  return <BoardPage />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1a1a24',
            border: '1px solid #2e2e45',
            color: '#f1f0ff',
          },
        }}
      />
    </QueryClientProvider>
  )
}

export default App
