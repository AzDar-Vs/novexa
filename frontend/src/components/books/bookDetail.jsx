import { Row, Col, Button, Badge } from 'react-bootstrap';

const BookDetail = ({ book, onAddToCart }) => {
  return (
    <Row>
      <Col md={4}>
        <img
          src={book.cover}
          alt={book.judul}
          className="img-fluid rounded shadow"
        />
      </Col>

      <Col md={8}>
        <h3>{book.judul}</h3>
        <p className="text-muted">{book.deskripsi}</p>

        <h4>Rp {book.harga?.toLocaleString()}</h4>

        <div className="mb-3">
          {book.genres?.map((g) => (
            <Badge key={g.id} bg="secondary" className="me-1">
              {g.nama}
            </Badge>
          ))}
        </div>

        <Button variant="primary" onClick={() => onAddToCart(book.id)}>
          Add to Cart
        </Button>
      </Col>
    </Row>
  );
};

export default BookDetail;
