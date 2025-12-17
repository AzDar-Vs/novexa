import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const SellerSidebar = () => (
  <Nav className="flex-column">
    <Nav.Link as={Link} to="/seller/dashboard">Dashboard</Nav.Link>
    <Nav.Link as={Link} to="/seller/books">My Books</Nav.Link>
    <Nav.Link as={Link} to="/seller/add-book">Add Book</Nav.Link>
    <Nav.Link as={Link} to="/seller/sales">Sales</Nav.Link>
    <Nav.Link as={Link} to="/seller/analytics">Analytics</Nav.Link>
    <Nav.Link as={Link} to="/seller/earnings">Earnings</Nav.Link>
  </Nav>
);

export default SellerSidebar;
