import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const DashboardLayout = ({ title, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  console.log('USER:', user);

  return (
    <>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>{title}</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link onClick={() => navigate('/buyer')}>Buyer</Nav.Link>
            <Nav.Link onClick={() => navigate('/seller')}>Seller</Nav.Link>
            <Nav.Link onClick={() => navigate('/admin')}>Admin</Nav.Link>
          </Nav>
          <Navbar.Text className="me-3">
            {user?.email} ({user?.role})
          </Navbar.Text>
          <Button size="sm" variant="outline-light" onClick={handleLogout}>
            Logout
          </Button>
        </Container>
      </Navbar>

      <Container className="mt-4">
        {children}
      </Container>
    </>
  );
};

export default DashboardLayout;
