import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '#/renderer/src/App.tsx'
import '#/renderer/src/i18n.ts'
import '#/renderer/src/styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
