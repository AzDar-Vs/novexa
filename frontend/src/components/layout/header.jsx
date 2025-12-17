import { Container } from 'react-bootstrap';

const Header = ({ title }) => {
  return (
    <header className="bg-dark text-white py-3">
      <Container>
        <h5 className="mb-0">{title || 'Digital Book Store'}</h5>
      </Container>
    </header>
  );
};

export default Header;
