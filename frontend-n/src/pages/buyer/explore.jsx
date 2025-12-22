import { useEffect, useState } from 'react';
import { 
  Container, Row, Col, Card, Form, Button, 
  Badge, InputGroup, Spinner, Pagination, Toast, ToastContainer,
  Navbar, Nav, Dropdown
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getBooksApi } from '../../api/buku.api';
import { getGenresApi } from '../../api/genre.api';
import { addToCartApi, getCartApi } from '../../api/cart.api';
import { useAuth } from '../../context/authContext';
import { 
  Book, House, Search, BookHalf, Cart, 
  Bell, Person, ClockHistory, Star, BoxArrowRight 
} from 'react-bootstrap-icons';

const ExploreBooks = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // State untuk cart
  const [cartItems, setCartItems] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [cartLoading, setCartLoading] = useState(false);

  // State untuk navbar
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const theme = {
    primary: '#2D5A27',
    secondary: '#4CAF50',
    accent: '#8BC34A',
    light: '#F5F5DC',
    gold: '#FFD700',
    dark: '#1A472A'
  };

  // Fungsi untuk load notifikasi (contoh implementasi)
  const loadNotifications = async () => {
    // Implementasi API notifikasi sesuai dengan backend Anda
    // const res = await getNotificationsApi();
    // setNotifications(res.data.data || []);
    // setUnreadNotifications(res.data.unreadCount || 0);
    
    // Simulasi sementara
    const mockNotifications = [
      { id: 1, title: 'Promo Spesial', message: 'Diskon 30% untuk buku pilihan', time: '2 jam lalu', isRead: false },
      { id: 2, title: 'Buku Baru', message: '5 buku baru telah ditambahkan', time: '1 hari lalu', isRead: true },
      { id: 3, title: 'Pembayaran Berhasil', message: 'Pembelian Anda telah diproses', time: '3 hari lalu', isRead: true }
    ];
    setNotifications(mockNotifications);
    setUnreadNotifications(mockNotifications.filter(n => !n.isRead).length);
  };

  // Fungsi untuk logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fungsi untuk load cart dari API
  const loadCart = async () => {
    try {
      const res = await getCartApi();
      setCartItems(res.data.data?.items || []);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    }
  };

  // Load data saat pertama kali component mount
  useEffect(() => {
    loadCart();
    loadNotifications();
  }, []);

  // Hitung total item di cart
  const getCartTotalItems = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  // Fungsi untuk cek apakah buku sudah di cart
  const isInCart = (bookId) => {
    return cartItems.some(item => item.id === bookId || item.ID_BUKU === bookId);
  };

  // Fungsi untuk tambah ke cart
  const handleAddToCart = async (book) => {
    try {
      setCartLoading(true);
      await addToCartApi(book.ID_BUKU, 1);
      
      // Update cart items setelah berhasil
      const updatedCartItems = [...cartItems];
      const existingIndex = updatedCartItems.findIndex(item => 
        item.id === book.ID_BUKU || item.ID_BUKU === book.ID_BUKU
      );
      
      if (existingIndex !== -1) {
        updatedCartItems[existingIndex] = {
          ...updatedCartItems[existingIndex],
          quantity: (updatedCartItems[existingIndex].quantity || 1) + 1
        };
      } else {
        updatedCartItems.push({
          id: book.ID_BUKU,
          ID_BUKU: book.ID_BUKU,
          title: book.JUDUL,
          price: book.HARGA,
          cover: book.COVER,
          quantity: 1
        });
      }
      
      setCartItems(updatedCartItems);
      setToastMessage(`${book.JUDUL} berhasil ditambahkan ke keranjang!`);
      setShowToast(true);
      
      // Auto-hide toast
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      setToastMessage('Gagal menambahkan ke keranjang. Coba lagi.');
      setShowToast(true);
    } finally {
      setCartLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        genre,
        sort: sortBy,
        price: priceRange,
        page,
        limit: 12
      };
      
      const res = await getBooksApi(params);
      setBooks(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [search, genre, sortBy, priceRange, page]);

  useEffect(() => {
    getGenresApi().then(res => setGenres(res.data.data || []));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks();
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

  const formatPrice = (price) => {
    if (price === 0 || price === null) return 'Gratis';
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const getStatusBadge = (status, isFree) => {
    if (isFree) return <Badge bg="success">Gratis</Badge>;
    if (status === 'published') return <Badge bg="primary">Tersedia</Badge>;
    if (status === 'draft') return <Badge bg="secondary">Draft</Badge>;
    return <Badge bg="warning">{status}</Badge>;
  };

  return (
    <Container fluid className="px-0" style={{ backgroundColor: theme.light, minHeight: '100vh' }}>
      {/* NAVBAR */}
      <Navbar expand="lg" style={{ backgroundColor: theme.primary, padding: '1rem 0' }}>
        <Container>
          <Navbar.Brand as={Link} to="/buyer" className="text-white fw-bold">
            <Book className="me-2" size={20} />
            Novexa
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0">
            <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
          </Navbar.Toggle>
          
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              <Nav.Link as={Link} to="/buyer" className="text-white mx-2">
                <House className="me-1" /> Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/browse" className="text-white mx-2 fw-bold">
                <Search className="me-1" /> Jelajahi
              </Nav.Link>
              <Nav.Link as={Link} to="/buyer/library" className="text-white mx-2">
                <BookHalf className="me-1" /> Perpustakaan
              </Nav.Link>
              <Nav.Link as={Link} to="/cart" className="text-white mx-2 position-relative">
                <Cart className="me-1" /> Keranjang
                {getCartTotalItems() > 0 && (
                  <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
                    {getCartTotalItems()}
                  </Badge>
                )}
              </Nav.Link>
              
              {/* Notifications Dropdown */}
              <Dropdown className="mx-3">
                <Dropdown.Toggle variant="outline-light" size="sm" className="position-relative">
                  <Bell />
                  {unreadNotifications > 0 && (
                    <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ minWidth: '300px' }}>
                  <Dropdown.Header>Notifikasi</Dropdown.Header>
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <Dropdown.Item 
                        key={notif.id} 
                        className={!notif.isRead ? 'fw-bold' : ''}
                        as={Link}
                        to="/notifications"
                      >
                        <div className="d-flex">
                          <div className="flex-grow-1">
                            <small className="d-block">{notif.title}</small>
                            <small className="text-muted">{notif.message}</small>
                          </div>
                          <small className="text-muted ms-2">{notif.time}</small>
                        </div>
                      </Dropdown.Item>
                    ))
                  ) : (
                    <Dropdown.Item disabled>
                      <small className="text-muted">Tidak ada notifikasi</small>
                    </Dropdown.Item>
                  )}
                  <Dropdown.Divider />
                  <Dropdown.Item as={Link} to="/notifications">Lihat Semua</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              
              {/* User Dropdown */}
              <Dropdown>
                <Dropdown.Toggle variant="outline-light" size="sm">
                  <Person className="me-2" />
                  {user?.nama?.split(' ')[0] || user?.name?.split(' ')[0] || 'User'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">
                    <Person className="me-2" /> Profil Saya
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/buyer/library">
                    <ClockHistory className="me-2" /> Riwayat Baca
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/buyer/reviews">
                    <Star className="me-2" /> Review Saya
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <BoxArrowRight className="me-2" /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <div className="py-5 text-center" style={{ backgroundColor: theme.primary }}>
        <Container>
          <h1 className="fw-bold text-white mb-3">
            <span className="me-2">📚</span> Jelajahi Koleksi Buku
          </h1>
          
          <p className="text-white-50 mb-4">
            Temukan buku-buku terbaik dari berbagai genre dan penulis
          </p>
          
          <Form onSubmit={handleSearch} className="mx-auto" style={{ maxWidth: '600px' }}>
            <InputGroup size="lg">
              <InputGroup.Text style={{ backgroundColor: 'white' }}>
                🔍
              </InputGroup.Text>
              <Form.Control
                placeholder="Cari buku berdasarkan judul, penulis, atau deskripsi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ borderLeft: 'none' }}
              />
              <Button type="submit" style={{ backgroundColor: theme.accent, border: 'none' }}>
                Cari
              </Button>
            </InputGroup>
          </Form>
        </Container>
      </div>

      {/* Cart Info Bar */}
      {cartItems.length > 0 && (
        <div className="bg-warning bg-opacity-10 py-2 border-bottom">
          <Container>
            <div className="d-flex justify-content-between align-items-center">
              <small>
                <span className="fw-bold">{cartItems.length} item</span> di keranjang • 
                Total: <span className="fw-bold">
                  Rp {cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0).toLocaleString()}
                </span>
              </small>
              <Link to="/cart" className="text-decoration-none">
                <small className="fw-bold">Lihat Keranjang →</small>
              </Link>
            </div>
          </Container>
        </div>
      )}

      {/* Filter & Sort Section */}
      <Container className="py-4">
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Row className="g-3 align-items-center">
              <Col md={3}>
                <div className="d-flex align-items-center">
                  <span className="me-2">🎭</span>
                  <Form.Select 
                    value={genre} 
                    onChange={(e) => setGenre(e.target.value)}
                    size="sm"
                  >
                    <option value="">Semua Genre</option>
                    {genres.map(g => (
                      <option key={g.ID_GENRE} value={g.ID_GENRE}>
                        {g.NAMA_GENRE}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              </Col>

              <Col md={3}>
                <div className="d-flex align-items-center">
                  <span className="me-2">📊</span>
                  <Form.Select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    size="sm"
                  >
                    <option value="newest">Terbaru</option>
                    <option value="popular">Populer</option>
                    <option value="rating">Rating Tertinggi</option>
                    <option value="price_low">Harga Terendah</option>
                    <option value="price_high">Harga Tertinggi</option>
                  </Form.Select>
                </div>
              </Col>

              <Col md={3}>
                <Form.Select 
                  value={priceRange} 
                  onChange={(e) => setPriceRange(e.target.value)}
                  size="sm"
                >
                  <option value="">Semua Harga</option>
                  <option value="free">Gratis</option>
                  <option value="0-50000">Rp 0 - 50,000</option>
                  <option value="50000-100000">Rp 50,000 - 100,000</option>
                  <option value="100000+"> Rp 100,000</option>
                </Form.Select>
              </Col>

              <Col md={3} className="text-end">
                <small className="text-muted">
                  {books.length} buku ditemukan
                </small>
                {cartItems.length > 0 && (
                  <div>
                    <small className="text-success">
                      🛒 {getCartTotalItems()} item di keranjang
                    </small>
                  </div>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Books Grid */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
            <p className="mt-3">Memuat buku...</p>
          </div>
        ) : books.length === 0 ? (
          <Card className="border-0 shadow-sm text-center py-5">
            <Card.Body>
              <span className="fs-1 mb-3">📚</span>
              <h5>Tidak ada buku ditemukan</h5>
              <p className="text-muted">Coba ubah filter pencarian Anda</p>
              <Button 
                variant="outline-success" 
                onClick={() => {
                  setSearch('');
                  setGenre('');
                  setPriceRange('');
                  setSortBy('newest');
                }}
              >
                Reset Filter
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <>
            <Row className="g-4">
              {books.map(book => {
                const alreadyInCart = isInCart(book.ID_BUKU);
                const cartItem = cartItems.find(item => item.id === book.ID_BUKU || item.ID_BUKU === book.ID_BUKU);
                
                return (
                  <Col key={book.ID_BUKU} xl={3} lg={4} md={6}>
                    <Card className="h-100 border-0 shadow-sm hover-shadow" 
                      style={{ 
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      {/* Book Cover */}
                      <div 
                        style={{ 
                          height: '250px',
                          backgroundColor: '#f8f9fa',
                          backgroundImage: book.COVER 
                            ? `url(${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${book.COVER})`
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          position: 'relative',
                          borderRadius: '8px 8px 0 0'
                        }}
                      >
                        {/* Status Badges */}
                        <div className="position-absolute top-0 start-0 m-2">
                          {getStatusBadge(book.STATUS, book.IS_FREE)}
                          {alreadyInCart && (
                            <Badge bg="warning" className="ms-1">
                              {cartItem?.quantity || 1}×
                            </Badge>
                          )}
                        </div>
                        
                        {/* View Count */}
                        <div className="position-absolute top-0 end-0 m-2">
                          <Badge bg="dark" className="d-flex align-items-center">
                            <span className="me-1">👁️</span> {book.VIEW_COUNT || 0}
                          </Badge>
                        </div>

                        {/* Price Tag */}
                        <div className="position-absolute bottom-0 end-0 m-2">
                          <Badge 
                            bg={book.HARGA === 0 ? "success" : "primary"} 
                            className="fs-6 px-3 py-2"
                          >
                            {formatPrice(book.HARGA)}
                          </Badge>
                        </div>
                      </div>

                      <Card.Body>
                        {/* Book Title */}
                        <h6 className="fw-bold mb-2" style={{ 
                          height: '48px', 
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {book.JUDUL}
                        </h6>

                        {/* Author */}
                        <div className="d-flex align-items-center mb-2">
                          <small className="text-muted">
                            oleh <strong>{book.penulis || 'Unknown Author'}</strong>
                          </small>
                        </div>

                        {/* Rating */}
                        <div className="d-flex align-items-center mb-3">
                          <div className="me-2">
                            {renderStars(book.avgRating)}
                          </div>
                          <small className="text-muted">
                            {book.avgRating ? parseFloat(book.avgRating).toFixed(1) : '0.0'} 
                            <span className="ms-1">({book.reviewCount || 0})</span>
                          </small>
                        </div>

                        {/* Description Preview */}
                        <p className="small text-muted mb-3" style={{
                          height: '60px',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {book.DESKRIPSI || 'Tidak ada deskripsi'}
                        </p>

                        {/* Action Buttons */}
                        <div className="d-flex gap-2">
                          <Button 
                            as={Link}
                            to={`/book/detail/${book.SLUG_BUKU || book.ID_BUKU}`}
                            variant="outline-success"
                            className="flex-grow-1"
                            size="sm"
                          >
                            <span className="me-1">👁️</span> Detail
                          </Button>
                          
                          {book.HARGA > 0 ? (
                            <Button 
                              variant={alreadyInCart ? "warning" : "success"}
                              size="sm"
                              className="px-3"
                              onClick={() => handleAddToCart(book)}
                              disabled={book.STATUS !== 'published' || cartLoading}
                            >
                              {alreadyInCart ? `✓ (${cartItem?.quantity || 1})` : '🛒'}
                            </Button>
                          ) : (
                            <Button 
                              as={Link}
                              to={`/read/${book.SLUG_BUKU || book.ID_BUKU}`}
                              variant="success"
                              size="sm"
                              className="px-3"
                            >
                              Baca
                            </Button>
                          )}
                        </div>
                      </Card.Body>

                      <Card.Footer className="bg-transparent border-0 pt-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            <span className="me-1">📅</span>
                            {book.CREATED_AT ? new Date(book.CREATED_AT).toLocaleDateString('id-ID') : 'N/A'}
                          </small>
                          
                          {book.genres && book.genres.length > 0 && (
                            <div>
                              {book.genres.slice(0, 2).map(genre => (
                                <Badge 
                                  key={genre.id} 
                                  bg="light" 
                                  text="dark" 
                                  className="me-1"
                                  style={{ fontSize: '10px' }}
                                >
                                  {genre.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card.Footer>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-5">
                <Pagination>
                  <Pagination.Prev 
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                  />
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <Pagination.Item
                        key={pageNum}
                        active={pageNum === page}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Pagination.Item>
                    );
                  })}
                  
                  <Pagination.Next 
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                  />
                </Pagination>
              </div>
            )}
          </>
        )}

        {/* Stats Section */}
        {!loading && books.length > 0 && (
          <Card className="mt-5 border-0 shadow-sm">
            <Card.Body>
              <Row className="text-center">
                <Col md={3}>
                  <h4 className="fw-bold" style={{ color: theme.primary }}>
                    {books.filter(b => b.HARGA === 0).length}
                  </h4>
                  <small>Buku Gratis</small>
                </Col>
                <Col md={3}>
                  <h4 className="fw-bold text-warning">
                    {(books.reduce((acc, book) => acc + (book.avgRating || 0), 0) / books.length).toFixed(1)}
                  </h4>
                  <small>Rating Rata-rata</small>
                </Col>
                <Col md={3}>
                  <h4 className="fw-bold text-success">
                    {books.filter(b => b.STATUS === 'published').length}
                  </h4>
                  <small>Buku Tersedia</small>
                </Col>
                <Col md={3}>
                  <h4 className="fw-bold text-info">
                    {new Set(books.map(b => b.penulis)).size}
                  </h4>
                  <small>Penulis Berbeda</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}
      </Container>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1055 }}>
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)}
          bg="success" 
          autohide
          delay={3000}
        >
          <Toast.Header>
            <strong className="me-auto">🛒 Berhasil!</strong>
            <small>Baru saja</small>
          </Toast.Header>
          <Toast.Body className="text-white">
            {toastMessage}
            <br />
            <small>Total item di keranjang: {getCartTotalItems()}</small>
            <div className="mt-2">
              <Button 
                as={Link} 
                to="/cart" 
                variant="light" 
                size="sm"
                className="me-2"
              >
                Lihat Keranjang
              </Button>
              <Button 
                as={Link} 
                to="/checkout" 
                variant="outline-light" 
                size="sm"
              >
                Checkout
              </Button>
            </div>
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Footer Section */}
      <div className="mt-5 py-4" style={{ backgroundColor: theme.dark, color: 'white' }}>
        <Container>
          <Row>
            <Col md={4}>
              <h5 className="fw-bold mb-3">
                <span className="me-2">📚</span> Novexa Books
              </h5>
              <p className="small">
                Platform membaca buku digital terbesar di Indonesia.
                Temukan ribuan buku dari berbagai genre.
              </p>
            </Col>
            <Col md={4}>
              <h6 className="fw-bold mb-3">Genre Populer</h6>
              <div className="d-flex flex-wrap gap-2">
                {genres.slice(0, 6).map(g => (
                  <Badge 
                    key={g.ID_GENRE} 
                    bg="light" 
                    text="dark"
                    as={Button}
                    variant="light"
                    size="sm"
                    onClick={() => setGenre(g.ID_GENRE)}
                    style={{ cursor: 'pointer' }}
                  >
                    {g.NAMA_GENRE}
                  </Badge>
                ))}
              </div>
            </Col>
            <Col md={4}>
              <h6 className="fw-bold mb-3">Tips Pencarian</h6>
              <ul className="small list-unstyled">
                <li className="mb-2">• Gunakan kata kunci spesifik</li>
                <li className="mb-2">• Filter berdasarkan genre favorit</li>
                <li className="mb-2">• Sortir berdasarkan rating</li>
                <li>• Cek buku gratis terlebih dahulu</li>
              </ul>
            </Col>
          </Row>
        </Container>
      </div>
    </Container>
  );
};

export default ExploreBooks;