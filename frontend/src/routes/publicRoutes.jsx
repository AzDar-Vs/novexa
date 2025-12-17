import Home from '../pages/public/home'
import Browse from '../pages/public/browse'
import BookDetailPage from '../pages/public/bookDetailPage'
import About from '../pages/public/about'
import Contact from '../pages/public/contact'

const publicRoutes = [
  { path: '/', element: <Home /> },
  { path: '/browse', element: <Browse /> },
  { path: '/books/:id', element: <BookDetailPage /> },
  { path: '/about', element: <About /> },
  { path: '/contact', element: <Contact /> },
]

export default publicRoutes
