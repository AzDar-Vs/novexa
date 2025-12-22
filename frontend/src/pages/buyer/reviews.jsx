import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Badge, Modal, Alert } from 'react-bootstrap';
import { getBuyerReviewsApi, addBuyerReviewApi, deleteBuyerReviewApi } from '../../api/buyer.api';
import { Star, StarFill, Pencil, Trash, Book, Search } from 'react-bootstrap-icons';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({ bookId: '', rating: 5, comment: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await getBuyerReviewsApi();
      setReviews(res.data.data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setFormData({
      bookId: review.bookId,
      rating: review.RATING,
      comment: review.comment
    });
    setShowModal(true);
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Hapus review ini?')) return;
    
    try {
      await deleteBuyerReviewApi(reviewId);
      setReviews(reviews.filter(r => r.id !== reviewId));
      setMessage('Review berhasil dihapus');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting review:', error);
      setMessage('Gagal menghapus review');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addBuyerReviewApi(formData);
      setShowModal(false);
      setMessage(editingReview ? 'Review berhasil diperbarui' : 'Review berhasil ditambahkan');
      loadReviews();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
      setMessage('Gagal menyimpan review');
    }
  };

  const filteredReviews = reviews.filter(review =>
    review.bookTitle.toLowerCase().includes(search.toLowerCase()) ||
    review.comment.toLowerCase().includes(search.toLowerCase())
  );

  const theme = {
    primary: '#2D5A27',
    light: '#F5F5DC'
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      i < rating ? 
        <StarFill key={i} className="text-warning" /> : 
        <Star key={i} className="text-warning" />
    ));
  };

  return (
    <Container fluid className="px-3 px-md-4" style={{ backgroundColor: theme.light, minHeight: '100vh' }}>
      {/* Header */}
      <div className="py-4">
        <h2 className="fw-bold" style={{ color: theme.primary }}>
          <Star className="me-2" /> Review Saya
        </h2>
        <p className="text-muted">Review yang telah Anda berikan untuk buku</p>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert variant="success" onClose={() => setMessage('')} dismissible>
          {message}
        </Alert>
      )}

      {/* Search & Stats */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col md={6}>
              <div className="d-flex align-items-center">
                <Search className="me-2" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Cari review..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </Col>
            <Col md={6} className="text-end">
              <div className="d-flex justify-content-end gap-3">
                <div className="text-center">
                  <h5 className="fw-bold mb-0">{reviews.length}</h5>
                  <small>Total Review</small>
                </div>
                <div className="text-center">
                  <h5 className="fw-bold text-warning mb-0">
                    {reviews.length > 0 
                      ? (reviews.reduce((acc, r) => acc + r.RATING, 0) / reviews.length).toFixed(1)
                      : '0'
                    }
                  </h5>
                  <small>Rating Rata-rata</small>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-3">Memuat review...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-5">
          <Card.Body>
            <Star size={48} className="text-muted mb-3" />
            <h5>Belum ada review</h5>
            <p className="text-muted">Berikan review untuk buku yang sudah Anda baca</p>
            <Button variant="success" className="mt-2" onClick={() => setShowModal(true)}>
              + Tambah Review
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {filteredReviews.map(review => (
            <Col key={review.id} lg={4} md={6}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h6 className="fw-bold mb-1">{review.bookTitle}</h6>
                      <small className="text-muted">oleh {review.author}</small>
                    </div>
                    <div>
                      {renderStars(review.RATING)}
                    </div>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted">Review Anda:</small>
                    <p className="mb-0 mt-1">{review.comment || 'Tidak ada komentar'}</p>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <Badge bg="info">
                        Rating Buku: {review.bookStats?.avgRating || '0'}/5
                      </Badge>
                      <small className="d-block text-muted mt-1">
                        {review.bookStats?.totalReviews || 0} review
                      </small>
                    </div>
                    <div className="d-flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline-primary"
                        onClick={() => handleEdit(review)}
                      >
                        <Pencil size={12} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline-danger"
                        onClick={() => handleDelete(review.id)}
                      >
                        <Trash size={12} />
                      </Button>
                    </div>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-transparent border-0">
                  <small className="text-muted">
                    Dibuat: {new Date(review.createdAt).toLocaleDateString('id-ID')}
                    {review.updatedAt !== review.createdAt && 
                      ` • Diperbarui: ${new Date(review.updatedAt).toLocaleDateString('id-ID')}`
                    }
                  </small>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Add/Edit Review Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingReview ? 'Edit Review' : 'Tambah Review Baru'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Pilih Buku</Form.Label>
              <Form.Select 
                value={formData.bookId}
                onChange={(e) => setFormData({...formData, bookId: e.target.value})}
                required
              >
                <option value="">-- Pilih Buku --</option>
                {/* Nanti diisi dengan buku yang sudah dibeli */}
                <option value="1">Petualangan di Hutan Magis</option>
                <option value="2">Cinta di Musim Hujan</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <div className="d-flex gap-1">
                {[1,2,3,4,5].map(star => (
                  <Button
                    key={star}
                    type="button"
                    variant={formData.rating >= star ? 'warning' : 'outline-warning'}
                    onClick={() => setFormData({...formData, rating: star})}
                  >
                    {formData.rating >= star ? <StarFill /> : <Star />}
                  </Button>
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Komentar</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.comment}
                onChange={(e) => setFormData({...formData, comment: e.target.value})}
                placeholder="Bagikan pengalaman membaca Anda..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Batal
            </Button>
            <Button variant="success" type="submit">
              {editingReview ? 'Perbarui' : 'Simpan'} Review
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Add Review Button */}
      {filteredReviews.length > 0 && (
        <div className="text-center mt-4">
          <Button variant="success" onClick={() => {
            setEditingReview(null);
            setFormData({ bookId: '', rating: 5, comment: '' });
            setShowModal(true);
          }}>
            + Tambah Review Lain
          </Button>
        </div>
      )}
    </Container>
  );
};

export default Reviews;