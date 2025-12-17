import React from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import useBuyerDashboard from '../../hooks/useBuyerDashboard';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const {
    stats,
    recentActivities,
    recentBooks,
  } = useBuyerDashboard();

  return (
    <Container fluid className="py-4 buyer-dashboard">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h4 mb-1">
            Welcome back, <strong>{user?.name}</strong>
          </h1>
          <p className="text-muted mb-0">
            Here’s what’s happening with your account today.
          </p>
        </div>

        <Button as={Link} to="/browse" variant="primary">
          <i className="bi bi-search me-2" />
          Browse Books
        </Button>
      </div>

      {/* Stats */}
      <Row className="mb-4">
        <Col xl={3} md={6} className="mb-3">
          <Card className="stat-card border-top border-3 border-primary h-100">
            <Card.Body>
              <h6 className="text-muted">Books in Library</h6>
              <h3>{stats.libraryCount}</h3>
              <small className="text-success">
                <i className="bi bi-arrow-up me-1" />
                {stats.libraryGrowth}% from last month
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6} className="mb-3">
          <Card className="stat-card border-top border-3 border-success h-100">
            <Card.Body>
              <h6 className="text-muted">Reading Progress</h6>
              <h3>{stats.readingProgress}%</h3>
              <ProgressBar
                now={stats.readingProgress}
                variant="success"
                className="mt-2"
              />
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6} className="mb-3">
          <Card className="stat-card border-top border-3 border-warning h-100">
            <Card.Body>
              <h6 className="text-muted">Cart Items</h6>
              <h3>{stats.cartItems}</h3>
              <small className="text-muted">
                Rp {stats.cartTotal.toLocaleString()}
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6} className="mb-3">
          <Card className="stat-card border-top border-3 border-info h-100">
            <Card.Body>
              <h6 className="text-muted">Reviews</h6>
              <h3>{stats.reviewCount}</h3>
              <small className="text-muted">
                Avg rating {stats.avgRating}
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Activity + Actions */}
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Activity</h5>
              <Button size="sm" variant="outline-primary">
                View All
              </Button>
            </Card.Header>

            <Card.Body className="p-0">
              {recentActivities.map((item) => (
                <div key={item.id} className="list-group-item px-4 py-3">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="mb-1">{item.title}</h6>
                      <small className="text-muted">{item.time}</small>
                    </div>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      as={Link}
                      to={`/buyer/library/${item.bookId}`}
                    >
                      Read
                    </Button>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body className="d-grid gap-2">
              <Button as={Link} to="/buyer/library" variant="primary">
                <i className="bi bi-book me-2" />
                Continue Reading
              </Button>
              <Button as={Link} to="/buyer/cart" variant="outline-success">
                <i className="bi bi-cart me-2" />
                View Cart
              </Button>
              <Button as={Link} to="/browse" variant="outline-info">
                <i className="bi bi-search me-2" />
                Browse Books
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Books */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Recently Added</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            {recentBooks.map((book) => (
              <Col md={3} sm={6} key={book.id} className="mb-3">
                <Card className="h-100">
                  <Card.Img
                    variant="top"
                    src={book.cover}
                    style={{ height: 160, objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Card.Title className="h6">{book.title}</Card.Title>
                    <small className="text-muted">{book.author}</small>
                    <div className="d-flex justify-content-between mt-2">
                      <Badge bg="success">Owned</Badge>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        as={Link}
                        to={`/buyer/library/${book.id}`}
                      >
                        Read
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default BuyerDashboard;
