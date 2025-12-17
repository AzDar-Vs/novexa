import Navbar from './navbar';
import Footer from './footer';

const MainLayout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-fill container py-4">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
