import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './styles/global.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          success: { duration: 3000, style: { background: '#276749', color: 'white', fontWeight: 600 } },
          error:   { duration: 4000, style: { background: '#c53030', color: 'white', fontWeight: 600 } },
        }}
      />
    </QueryClientProvider>
  </StrictMode>
)
