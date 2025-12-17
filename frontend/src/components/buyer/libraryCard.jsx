import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const LibraryCard = ({ book, onRead }) => {
  return (
    <Card className="h-100 shadow-sm">
      <Card.Img
        variant="top"
        src={book.cover || '/assets/images/book-placeholder.jpg'}
        style={{ height: 200, objectFit: 'cover' }}
      />

      <Card.Body>
        <Card.Title className="text-truncate">
          {book.judul}
        </Card.Title>

        <Card.Text className="text-muted small">
          {book.deskripsi?.slice(0, 70)}...
        </Card.Text>
      </Card.Body>

      <Card.Footer className="bg-white border-0">
        <Link to={`/reader/${book.id}`}>
          <Button variant="primary" size="sm" className="w-100">
            Baca Buku
          </Button>
        </Link>
      </Card.Footer>
    </Card>
  );
};

export default LibraryCard;
