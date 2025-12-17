import { Row, Col } from 'react-bootstrap';
import BookCard from './BookCard';

const BookList = ({ books, onAddToCart, onFavorite }) => {
  if (!books?.length) {
    return <p className="text-center text-muted">No books found.</p>;
  }

  return (
    <Row>
      {books.map((book) => (
        <Col key={book.id} md={3} sm={6} className="mb-4">
          <BookCard
            book={book}
            onAddToCart={onAddToCart}
            onFavorite={onFavorite}
          />
        </Col>
      ))}
    </Row>
  );
};

export default BookList;
