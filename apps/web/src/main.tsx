import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// CSS gốc từ project cũ
import './styles/style.css'
import './styles/modern-fashion.css'
import './styles/responsive-index.css'
import './styles/login.css'

// Admin CSS
import './styles/admin/admin-common.css'
import './styles/admin/admin-layout.css'
import './styles/admin/admin-dashboard.css'
import './styles/admin/admin-profile.css'
import './styles/admin/admin-products.css'
import './styles/admin/admin-orders.css'
import './styles/admin/admin-customers.css'
import './styles/admin/admin-categories.css'
import './styles/admin/admin-attributes.css'
import './styles/admin/admin-inventory.css'
import './styles/admin/admin-alerts.css'
import './styles/admin/admin-reports.css'
import './styles/admin/admin-settings.css'
import './styles/admin/admin-settings-bank.css'
import './styles/admin/admin-product-add.css'
import './styles/admin/admin-promotions.css'

// Footer mới

// CSS bổ sung cho React
import './App.css'

// UI Enhancements - animations, transitions, depth
import './styles/enhancements.css'

// Product Card IVY moda style

// Footer IVY moda style

// Cart page IVY moda style

// Checkout page IVY moda style

// Admin page scene variants
import './styles/admin/admin-page-variants.css'
import './styles/admin/milkshop-admin.css'

import App from './App.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
