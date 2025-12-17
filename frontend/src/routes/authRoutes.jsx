import Login from '../pages/auth/login';
import Register from '../pages/auth/register';
import ForgotPassword from '../pages/auth/forgotPassword';
import ResetPassword from '../pages/auth/resetPassword';

const authRoutes = [
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password/:token', element: <ResetPassword /> },
];
<Route element={<AuthGuard />}>
  {authRoutes.map((r, i) => (
    <Route key={i} path={r.path} element={r.element} />
  ))}
</Route>


export default authRoutes;
