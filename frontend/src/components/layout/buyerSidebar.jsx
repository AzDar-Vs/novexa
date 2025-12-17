import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const BuyerSidebar = () => (
  <Nav className="flex-column">
    <Nav.Link as={Link} to="/buyer/dashboard">Dashboard</Nav.Link>
    <Nav.Link as={Link} to="/buyer/library">My Library</Nav.Link>
    <Nav.Link as={Link} to="/buyer/orders">Orders</Nav.Link>
    <Nav.Link as={Link} to="/buyer/cart">Cart</Nav.Link>
    <Nav.Link as={Link} to="/buyer/profile">Profile</Nav.Link>
  </Nav>
);

export default BuyerSidebar;
