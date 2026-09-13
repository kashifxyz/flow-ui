import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { queryClient } from './lib/query'
import { router } from './routes/router'
import { ThemeProvider } from './theme/ThemeProvider'

const App = () => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
