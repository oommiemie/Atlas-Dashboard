import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
/* HeroUI v3 precompiled css — โหลดก่อน index.css เพื่อให้สไตล์แอป (unlayered) ชนะ preflight (layered) */
import '../node_modules/@heroui/styles/dist/heroui.min.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
