import { Card, Button, Badge } from 'react-bootstrap';

const BookCard = ({ book }) => {
  return (
    <Card className="h-100 shadow-sm">
      <Card.Img variant="top" src={book.cover} />
      <Card.Body className="d-flex flex-column">
        <Card.Title>{book.title}</Card.Title>
        <Card.Text className="text-muted">
          {book.author}
        </Card.Text>

        {book.isFree ? (
          <Badge bg="success" className="mb-2">Gratis</Badge>
        ) : (
          <Badge bg="primary" className="mb-2">
            Rp {book.price.toLocaleString()}
          </Badge>
        )}

        <Button variant="outline-primary" className="mt-auto">
          {book.isFree ? 'Baca' : 'Detail'}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default BookCard;
