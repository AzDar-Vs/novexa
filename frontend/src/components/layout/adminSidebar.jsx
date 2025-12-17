import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AdminSidebar = () => (
  <Nav className="flex-column">
    <Nav.Link as={Link} to="/admin/dashboard">Dashboard</Nav.Link>
    <Nav.Link as={Link} to="/admin/users">Users</Nav.Link>
    <Nav.Link as={Link} to="/admin/books">Books</Nav.Link>
    <Nav.Link as={Link} to="/admin/transactions">Transactions</Nav.Link>
    <Nav.Link as={Link} to="/admin/categories">Categories</Nav.Link>
    <Nav.Link as={Link} to="/admin/reports">Reports</Nav.Link>
    <Nav.Link as={Link} to="/admin/settings">Settings</Nav.Link>
  </Nav>
);

export default AdminSidebar;
