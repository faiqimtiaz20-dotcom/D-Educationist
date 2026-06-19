import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/globals.css'
import { Providers } from '@/app/providers'
import App from '@/app/App'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'

async function enableMocking() {
  if (!import.meta.env.DEV) return

  try {
    const { worker } = await import('@/mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: { url: '/mockServiceWorker.js' },
    })
  } catch (error) {
    console.warn('[MSW] Mock service worker failed to start:', error)
  }
}

enableMocking().then(() => {
  const root = document.getElementById('root')
  if (!root) throw new Error('Root element not found')

  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <Providers>
          <App />
        </Providers>
      </ErrorBoundary>
    </StrictMode>,
  )
})
