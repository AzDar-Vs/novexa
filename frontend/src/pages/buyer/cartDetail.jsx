import { useEffect, useState } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, 
  Alert, Spinner, Modal, ProgressBar, Tabs, Tab,
  ListGroup, Accordion
} from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCartApi, removeFromCartApi, updateCartItemApi, clearCartApi } from '../../api/cart.api';
import { getBookDetailApi } from '../../api/buku.api';

const CartDetail = () => {
  const { bookId } = useParams();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [bookDetail, setBookDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookLoading, setBookLoading] = useState(false);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const navigate = useNavigate();

  const theme = {
    primary: '#2D5A27',
    secondary: '#4CAF50',
    accent: '#8BC34A',
    light: '#F5F5DC',
    gold: '#FFD700',
    dark: '#1A472A'
  };

  // Load cart data
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

  // Load book detail if bookId is provided
  const loadBookDetail = async () => {
    if (!bookId) return;
    
    try {
      setBookLoading(true);
      const res = await getBookDetailApi(bookId);
      setBookDetail(res.data.data);
    } catch (error) {
      console.error('Error loading book detail:', error);
    } finally {
      setBookLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    loadBookDetail();
  }, [bookId]);

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

  const renderStars = (rating) => {
    const stars = [];
    const starRating = rating || 0;
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.round(starRating)) {
        stars.push(<span key={i} className="text-warning">★</span>);
      } else {
        stars.push(<span key={i} className="text-warning" style={{ opacity: 0.3 }}>★</span>);
      }
    }
    return <>{stars}</>;
  };

  // Get selected book from cart
  const selectedCartItem = cart.items?.find(item => item.id === parseInt(bookId) || item.ID_BUKU === parseInt(bookId));

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
          onClick={() => navigate('/cart')}
        >
          ← Kembali ke Daftar Buku
        </Button>
        
        <Row className="align-items-center">
          <Col md={8}>
            <h1 className="fw-bold" style={{ color: theme.primary }}>
              📚 Detail Buku {selectedCartItem ? `"${selectedCartItem.title}"` : ''}
            </h1>
            <p className="text-muted">
              {getTotalItems()} item di daftar • Total nilai: <span className="fw-bold">{formatPrice(cart.total)}</span>
            </p>
          </Col>
          <Col md={4} className="text-end">
            <Button 
              as={Link}
              to="/checkout"
              style={{ backgroundColor: theme.primary, border: 'none' }}
              className="me-2"
            >
              🛒 Checkout
            </Button>
            <Button 
              variant="outline-success"
              as={Link}
              to="/explore"
            >
              + Tambah Buku
            </Button>
          </Col>
        </Row>
      </div>

      {/* Main Content */}
      <Row className="g-4">
        {/* Left Column - Book Details */}
        <Col lg={8}>
          {selectedCartItem ? (
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Row>
                  {/* Book Cover */}
                  <Col md={4} className="mb-4 mb-md-0">
                    <div 
                      style={{
                        width: '100%',
                        height: '300px',
                        backgroundColor: '#f0f0f0',
                        backgroundImage: selectedCartItem.cover ? 
                          `url(${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${selectedCartItem.cover})` : 
                          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '8px',
                        marginBottom: '20px'
                      }}
                    >
                      {!selectedCartItem.cover && (
                        <div className="h-100 d-flex align-items-center justify-content-center">
                          <span className="fs-1">📚</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="text-center">
                      <h5 className="mb-3">Jumlah: {selectedCartItem.quantity || 1}</h5>
                      <div className="d-flex justify-content-center align-items-center">
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => handleUpdateQuantity(selectedCartItem.id, (selectedCartItem.quantity || 1) - 1)}
                          disabled={updatingItem === selectedCartItem.id}
                          className="me-2"
                        >
                          −
                        </Button>
                        
                        <Badge bg="success" className="px-3 py-2 fs-6">
                          {selectedCartItem.quantity || 1}
                        </Badge>
                        
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => handleUpdateQuantity(selectedCartItem.id, (selectedCartItem.quantity || 1) + 1)}
                          disabled={updatingItem === selectedCartItem.id}
                          className="ms-2"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </Col>
                  
                  {/* Book Info */}
                  <Col md={8}>
                    <Tabs
                      activeKey={activeTab}
                      onSelect={(k) => setActiveTab(k)}
                      className="mb-4"
                    >
                      <Tab eventKey="details" title="📖 Detail">
                        <div className="mt-3">
                          <h3 className="fw-bold mb-3">{selectedCartItem.title}</h3>
                          
                          <div className="d-flex align-items-center mb-3">
                            <div className="me-3">
                              {renderStars(selectedCartItem.rating || 0)}
                            </div>
                            <span className="text-muted">
                              {selectedCartItem.rating ? parseFloat(selectedCartItem.rating).toFixed(1) : '0.0'} 
                              ({selectedCartItem.reviewCount || 0} review)
                            </span>
                          </div>
                          
                          <div className="mb-4">
                            <h5 className="text-success">{formatPrice(selectedCartItem.price)}</h5>
                            <Badge bg="light" text="dark" className="me-2">
                              {selectedCartItem.pages || '??'} halaman
                            </Badge>
                            <Badge bg="light" text="dark" className="me-2">
                              {selectedCartItem.language || 'Indonesia'}
                            </Badge>
                            {selectedCartItem.isFree && (
                              <Badge bg="success">Gratis</Badge>
                            )}
                          </div>
                          
                          <h5 className="mb-2">Deskripsi</h5>
                          <p className="text-muted">
                            {selectedCartItem.description || bookDetail?.DESKRIPSI || 'Tidak ada deskripsi tersedia.'}
                          </p>
                          
                          <div className="mt-4">
                            <h5 className="mb-2">Informasi Buku</h5>
                            <ListGroup variant="flush">
                              <ListGroup.Item className="d-flex justify-content-between">
                                <span>Penulis</span>
                                <span className="fw-bold">{selectedCartItem.author || 'Tidak diketahui'}</span>
                              </ListGroup.Item>
                              <ListGroup.Item className="d-flex justify-content-between">
                                <span>Penerbit</span>
                                <span>{selectedCartItem.publisher || 'Tidak diketahui'}</span>
                              </ListGroup.Item>
                              <ListGroup.Item className="d-flex justify-content-between">
                                <span>Tahun Terbit</span>
                                <span>{selectedCartItem.year || 'Tidak diketahui'}</span>
                              </ListGroup.Item>
                              <ListGroup.Item className="d-flex justify-content-between">
                                <span>ISBN</span>
                                <span>{selectedCartItem.isbn || 'Tidak tersedia'}</span>
                              </ListGroup.Item>
                            </ListGroup>
                          </div>
                        </div>
                      </Tab>
                      
                      <Tab eventKey="chapters" title="📑 Bab">
                        <div className="mt-3">
                          <h5 className="mb-3">Daftar Bab</h5>
                          {selectedCartItem.chapters && selectedCartItem.chapters.length > 0 ? (
                            <Accordion>
                              {selectedCartItem.chapters.slice(0, 5).map((chapter, index) => (
                                <Accordion.Item eventKey={index.toString()} key={index}>
                                  <Accordion.Header>
                                    <div className="d-flex justify-content-between w-100 pe-3">
                                      <span>Bab {chapter.number}: {chapter.title}</span>
                                      <Badge bg={chapter.isFree ? "success" : "secondary"}>
                                        {chapter.isFree ? "Gratis" : "Berbayar"}
                                      </Badge>
                                    </div>
                                  </Accordion.Header>
                                  <Accordion.Body>
                                    <p className="small">{chapter.contentPreview || 'Tidak ada preview tersedia.'}</p>
                                    <div className="d-flex justify-content-between">
                                      <small className="text-muted">
                                        {chapter.pages || '??'} halaman • {chapter.readingTime || '??'} menit
                                      </small>
                                      <Button size="sm" variant="outline-primary">
                                        Preview
                                      </Button>
                                    </div>
                                  </Accordion.Body>
                                </Accordion.Item>
                              ))}
                            </Accordion>
                          ) : (
                            <Alert variant="info">
                              Informasi bab belum tersedia untuk buku ini.
                            </Alert>
                          )}
                        </div>
                      </Tab>
                      
                      <Tab eventKey="reviews" title="⭐ Review">
                        <div className="mt-3">
                          <h5 className="mb-3">Ulasan Pembaca</h5>
                          {selectedCartItem.reviews && selectedCartItem.reviews.length > 0 ? (
                            selectedCartItem.reviews.slice(0, 3).map((review, index) => (
                              <Card key={index} className="mb-3">
                                <Card.Body>
                                  <div className="d-flex justify-content-between mb-2">
                                    <div>
                                      <strong>{review.reviewer}</strong>
                                      <div className="small">
                                        {renderStars(review.rating)}
                                      </div>
                                    </div>
                                    <small className="text-muted">
                                      {new Date(review.date).toLocaleDateString('id-ID')}
                                    </small>
                                  </div>
                                  <p className="mb-0">{review.comment}</p>
                                </Card.Body>
                              </Card>
                            ))
                          ) : (
                            <Alert variant="info">
                              Belum ada review untuk buku ini.
                            </Alert>
                          )}
                        </div>
                      </Tab>
                    </Tabs>
                    
                    {/* Action Buttons */}
                    <div className="d-flex gap-2 mt-4">
                      <Button 
                        variant="danger" 
                        onClick={() => handleRemoveItem(selectedCartItem.id)}
                        disabled={updatingItem === selectedCartItem.id}
                      >
                        {updatingItem === selectedCartItem.id ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Memproses...
                          </>
                        ) : (
                          'Hapus dari Daftar'
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline-success"
                        as={Link}
                        to={`/buku/${selectedCartItem.slug || selectedCartItem.id}`}
                      >
                        Lihat Halaman Buku
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ) : (
            <Alert variant="warning">
              <h5>Buku tidak ditemukan di daftar</h5>
              <p>Buku ini mungkin sudah dihapus atau tidak tersedia.</p>
              <Button as={Link} to="/cart">
                Kembali ke Daftar
              </Button>
            </Alert>
          )}
        </Col>
        
        {/* Right Column - Cart Summary */}
        <Col lg={4}>
          {/* Cart Summary */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">📋 Ringkasan Daftar</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Item</span>
                  <span className="fw-bold">{getTotalItems()}</span>
                </div>
                
                <div className="d-flex justify-content-between mb-2">
                  <span>Jenis Buku Berbeda</span>
                  <span>{cart.items?.length || 0}</span>
                </div>
                
                <hr />
                
                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Total Nilai</span>
                  <span className="text-success">{formatPrice(cart.total)}</span>
                </div>
              </div>
              
              <Button 
                as={Link}
                to="/checkout"
                style={{ backgroundColor: theme.primary, border: 'none' }}
                className="w-100 mb-2"
              >
                🛒 Lanjut ke Pembayaran
              </Button>
              
              <Button 
                variant="outline-danger" 
                className="w-100"
                onClick={() => setShowClearModal(true)}
              >
                Hapus Semua Buku
              </Button>
            </Card.Body>
          </Card>
          
          {/* Other Books in Cart */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">📚 Buku Lain di Daftar</h5>
            </Card.Header>
            <Card.Body>
              {cart.items?.filter(item => item.id !== parseInt(bookId)).slice(0, 3).map(item => (
                <div key={item.id} className="d-flex align-items-center mb-3">
                  <div 
                    className="me-3"
                    style={{
                      width: '50px',
                      height: '70px',
                      backgroundColor: '#f0f0f0',
                      backgroundImage: item.cover ? 
                        `url(${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.cover})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: '4px'
                    }}
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-1 small">{item.title}</h6>
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">{formatPrice(item.price)}</small>
                      <Badge bg="light" text="dark">{item.quantity || 1}×</Badge>
                    </div>
                    <Button 
                      size="sm" 
                      variant="link" 
                      as={Link}
                      to={`/cart/detail/${item.id}`}
                      className="p-0"
                    >
                      Lihat Detail
                    </Button>
                  </div>
                </div>
              ))}
              
              {cart.items?.length > 4 && (
                <div className="text-center">
                  <Button 
                    variant="link" 
                    as={Link}
                    to="/cart"
                  >
                    Lihat Semua ({cart.items.length - 1} buku lainnya)
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
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

export default CartDetail;