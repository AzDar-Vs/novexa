import { Navbar as BsNavbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <BsNavbar bg="light" expand="lg" className="shadow-sm">
      <Container>
        <BsNavbar.Brand as={Link} to="/">BookStore</BsNavbar.Brand>

        <BsNavbar.Toggle />
        <BsNavbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/browse">Browse</Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link>
          </Nav>

          <Nav>
            <Nav.Link as={Link} to="/login">Login</Nav.Link>
            <Nav.Link as={Link} to="/register">Register</Nav.Link>
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;
