import { Routes, Route } from 'react-router-dom'

import publicRoutes from './publicRoutes'
import authRoutes from './authRoutes'
import buyerRoutes from './buyerRoutes'
import sellerRoutes from './sellerRoutes'
import adminRoutes from './adminRoutes'

import ProtectedRoute from './protectedRoute'
import NotFound from './notFound'

const AppRoutes = () => {
  return (
    <Routes>
      {publicRoutes.map((r, i) => (
        <Route key={i} path={r.path} element={r.element} />
      ))}

      {authRoutes.map((r, i) => (
        <Route key={i} path={r.path} element={r.element} />
      ))}

      {/* BUYER */}
      <Route element={<ProtectedRoute roles={['buyer']} />}>
        {buyerRoutes.map((r, i) => (
          <Route key={i} path={r.path} element={r.element} />
        ))}
      </Route>

      {/* SELLER */}
      <Route element={<ProtectedRoute roles={['seller']} />}>
        {sellerRoutes.map((r, i) => (
          <Route key={i} path={r.path} element={r.element} />
        ))}
      </Route>

      {/* ADMIN */}
      <Route element={<ProtectedRoute roles={['admin']} />}>
        {adminRoutes.map((r, i) => (
          <Route key={i} path={r.path} element={r.element} />
        ))}
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
