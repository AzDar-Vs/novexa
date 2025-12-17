import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import bookService from '../../services/bookService';

const BuyerLibrary = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        setLoading(true);
        const res = await bookService.getUserLibrary();
        setBooks(res?.data || []);
      } catch (err) {
        setError('Failed to load your library.');
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, []);

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-success">My Library</h3>
          <p className="text-muted mb-0">
            Books you have purchased and can read anytime
          </p>
        </div>
        <Button as={Link} to="/browse" variant="outline-success">
          <i className="bi bi-search me-2"></i>
          Browse Books
        </Button>
      </div>

      {/* State */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && books.length === 0 && (
        <Alert variant="warning">
          You don’t have any books yet. Start browsing and buy your first book 📚
        </Alert>
      )}

      {/* Book Grid */}
      <Row>
        {books.map((book) => (
          <Col key={book.id} xl={3} lg={4} md={6} sm={6} className="mb-4">
            <Card className="h-100 shadow-sm border-0">
              <Card.Img
                variant="top"
                src={book.cover_url || '/assets/images/book-placeholder.jpg'}
                style={{ height: 220, objectFit: 'cover' }}
              />

              <Card.Body className="d-flex flex-column">
                <h6 className="fw-bold mb-1 text-truncate">{book.title}</h6>
                <small className="text-muted mb-3">{book.author}</small>

                <div className="mt-auto d-grid gap-2">
                  <Button
                    as={Link}
                    to={`/reader/${book.id}`}
                    variant="success"
                    size="sm"
                  >
                    <i className="bi bi-book-half me-2"></i>
                    Continue Reading
                  </Button>

                  <Button
                    as={Link}
                    to={`/books/${book.id}`}
                    variant="outline-secondary"
                    size="sm"
                  >
                    View Details
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default BuyerLibrary;
