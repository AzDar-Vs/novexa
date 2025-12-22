import { useEffect, useState } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, 
  Alert, Spinner, Modal, InputGroup, Form
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getCartApi, removeFromCartApi, updateCartItemApi, clearCartApi } from '../../api/cart.api';

const Cart = () => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const navigate = useNavigate();

  const theme = {
    primary: '#2D5A27',
    secondary: '#4CAF50',
    accent: '#8BC34A',
    light: '#F5F5DC',
    gold: '#FFD700',
    dark: '#1A472A'
  };

  const loadCart = async () => {
    try {
      setLoading(true);
      const res = await getCartApi();
      setCart(res.data.data || { items: [], total: 0 });
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleRemoveItem = async (itemId) => {
    try {
      setUpdatingItem(itemId);
      await removeFromCartApi(itemId);
      await loadCart();
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      setUpdatingItem(itemId);
      await updateCartItemApi(itemId, newQuantity);
      await loadCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCartApi();
      await loadCart();
      setShowClearModal(false);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getTotalItems = () => {
    return cart.items?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;
  };

  const formatPrice = (price) => {
    return `Rp ${price?.toLocaleString('id-ID') || '0'}`;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center" style={{ backgroundColor: theme.light, minHeight: '100vh' }}>
        <Spinner animation="border" variant="success" />
        <p className="mt-3">Memuat daftar buku...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="px-3 px-md-4" style={{ backgroundColor: theme.light, minHeight: '100vh' }}>
      {/* Header */}
      <div className="py-4">
        <Button 
          variant="link" 
          className="text-decoration-none mb-3" 
          onClick={() => navigate(-1)}
        >
          ← Kembali
        </Button>
        <h1 className="fw-bold" style={{ color: theme.primary }}>
          📚 Daftar Buku Saya
        </h1>
        <p className="text-muted">
          {getTotalItems()} item • Total nilai: <span className="fw-bold">{formatPrice(cart.total)}</span>
        </p>
      </div>

      {cart.items?.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-5">
          <Card.Body>
            <div className="py-4">
              <span className="fs-1 mb-3">📚</span>
              <h4>Belum ada buku dalam daftar</h4>
              <p className="text-muted mb-4">Tambahkan buku dari katalog untuk mulai membaca</p>
              <Button 
                as={Link} 
                to="/browse" 
                style={{ backgroundColor: theme.primary, border: 'none' }}
              >
                Jelajahi Buku
              </Button>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {/* Items List */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Buku ({getTotalItems()})</h5>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => setShowClearModal(true)}
                >
                  Hapus Semua
                </Button>
              </Card.Header>
              <Card.Body>
                {cart.items.map(item => (
                  <Card key={item.id} className="mb-3 border-0 shadow-sm">
                    <Card.Body>
                      <Row className="align-items-center">
                        <Col md={2} className="text-center">
                          <div 
                            className="mx-auto"
                            style={{
                              width: '80px',
                              height: '100px',
                              backgroundColor: '#f0f0f0',
                              backgroundImage: item.cover ? `url(${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.cover})` : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              borderRadius: '4px'
                            }}
                          >
                            {!item.cover && (
                              <div className="h-100 d-flex align-items-center justify-content-center">
                                <span className="fs-4">📚</span>
                              </div>
                            )}
                          </div>
                        </Col>
                        
                        <Col md={6}>
                          <h6 className="fw-bold mb-1">{item.title}</h6>
                          <p className="text-muted mb-2 small">
                            {item.author || 'Penulis tidak diketahui'}
                          </p>
                          <div className="d-flex align-items-center">
                            <Badge bg="light" text="dark" className="me-2">
                              {formatPrice(item.price)} per item
                            </Badge>
                          </div>
                        </Col>
                        
                        <Col md={2}>
                          <div className="d-flex align-items-center">
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, (item.quantity || 1) - 1)}
                              disabled={updatingItem === item.id}
                            >
                              −
                            </Button>
                            
                            <div className="mx-3">
                              <h5 className="mb-0">{item.quantity || 1}</h5>
                            </div>
                            
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                              disabled={updatingItem === item.id}
                            >
                              +
                            </Button>
                          </div>
                        </Col>
                        
                        <Col md={2} className="text-end">
                          <h5 className="fw-bold text-success mb-2">
                            {formatPrice((item.price || 0) * (item.quantity || 1))}
                          </h5>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={updatingItem === item.id}
                          >
                            {updatingItem === item.id ? (
                              <Spinner size="sm" />
                            ) : (
                              'Hapus'
                            )}
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}
              </Card.Body>
            </Card>
          </Col>

          {/* Order Summary */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
              <Card.Header className="bg-white">
                <h5 className="mb-0">Ringkasan</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal ({getTotalItems()} item)</span>
                    <span>{formatPrice(cart.total)}</span>
                  </div>
                  
                  <hr />
                  
                  <div className="d-flex justify-content-between fw-bold fs-5">
                    <span>Total</span>
                    <span className="text-success">{formatPrice(cart.total)}</span>
                  </div>
                </div>

                <Alert variant="info" className="small">
                  <strong>💡 Info:</strong> Buku akan tersedia di library setelah pembelian
                </Alert>

                <div className="d-grid gap-2">
                  <Button 
                    as={Link}
                    to="/checkout"
                    style={{ backgroundColor: theme.primary, border: 'none' }}
                    size="lg"
                  >
                    🛒 Lanjut ke Pembayaran
                  </Button>
                  
                  <Button 
                    as={Link}
                    to="/browse"
                    variant="outline-success"
                  >
                    + Tambah Buku Lain
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Recommendations Section */}
      {cart.items?.length > 0 && (
        <div className="mt-5">
          <h4 className="fw-bold mb-4" style={{ color: theme.primary }}>
            📚 Rekomendasi untuk Anda
          </h4>
          <Row className="g-3">
            <Col md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center">
                  <span className="fs-1">🔥</span>
                  <h6 className="mt-2">Buku Terpopuler</h6>
                  <Button variant="link" as={Link} to="/explore?sort=popular">
                    Lihat
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center">
                  <span className="fs-1">🎁</span>
                  <h6 className="mt-2">Buku Gratis</h6>
                  <Button variant="link" as={Link} to="/explore?price=free">
                    Lihat
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center">
                  <span className="fs-1">⭐</span>
                  <h6 className="mt-2">Rating Tertinggi</h6>
                  <Button variant="link" as={Link} to="/explore?sort=rating">
                    Lihat
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center">
                  <span className="fs-1">💸</span>
                  <h6 className="mt-2">Harga Terendah</h6>
                  <Button variant="link" as={Link} to="/explore?sort=price_low">
                    Lihat
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* Clear Cart Modal */}
      <Modal show={showClearModal} onHide={() => setShowClearModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Hapus Semua Buku</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Apakah Anda yakin ingin menghapus semua buku dari daftar?</p>
          <p className="text-muted small">
            {getTotalItems()} buku akan dihapus dari daftar Anda.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>
            Batal
          </Button>
          <Button variant="danger" onClick={handleClearCart}>
            Ya, Hapus Semua
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Cart;