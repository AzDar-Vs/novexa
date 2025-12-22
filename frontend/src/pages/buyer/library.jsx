import { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Form, InputGroup, 
  Spinner, Badge, Dropdown, Navbar, Nav 
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getBuyerLibraryApi } from '../../api/buyer.api';
import { getCartApi } from '../../api/cart.api';
import { 
  Book, Search, Filter, SortDown, Star, BookHalf, Clock,
  House, Bell, Person, Cart, Bookmark, ClockHistory, BoxArrowRight
} from 'react-bootstrap-icons';
import { useAuth } from '../../context/authContext';

const Library = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterGenre, setFilterGenre] = useState('');
  
  // State untuk navbar
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [cartItems, setCartItems] = useState([]);

  const theme = {
    primary: '#2D5A27',
    secondary: '#4CAF50',
    accent: '#8BC34A',
    light: '#F5F5DC',
    gold: '#FFD700',
    dark: '#1A472A'
  };

  useEffect(() => {
    loadBooks();
    loadCart();
    loadNotifications();
  }, [sortBy, filterGenre]);

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

  // Fungsi untuk load notifikasi (contoh implementasi)
  const loadNotifications = async () => {
    // Implementasi API notifikasi sesuai dengan backend
    // const res = await getNotificationsApi();
    // setNotifications(res.data.data || []);
    // setUnreadNotifications(res.data.unreadCount || 0);
    
    // Simulasi sementara
    const mockNotifications = [
      { id: 1, title: 'Buku Baru', message: '5 buku baru di koleksi', time: '2 jam lalu', isRead: false },
      { id: 2, title: 'Progress Membaca', message: 'Anda mencapai 75% di "Laskar Pelangi"', time: '1 hari lalu', isRead: true },
      { id: 3, title: 'Promo Spesial', message: 'Diskon 30% untuk buku bestseller', time: '3 hari lalu', isRead: true }
    ];
    setNotifications(mockNotifications);
    setUnreadNotifications(mockNotifications.filter(n => !n.isRead).length);
  };

  // Fungsi untuk logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const loadBooks = async () => {
    try {
      setLoading(true);
      const params = { search, sort: sortBy, genre: filterGenre };
      const res = await getBuyerLibraryApi(params);
      setBooks(res.data.data || []);
    } catch (error) {
      console.error('Error loading library:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadBooks();
  };

  // Hitung total item di cart
  const getCartTotalItems = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
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
              <Nav.Link as={Link} to="/browse" className="text-white mx-2">
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

      {/* Main Content */}
      <Container className="py-4">
        {/* Header */}
        <div className="py-4">
          <h2 className="fw-bold" style={{ color: theme.primary }}>
            <Book className="me-2" /> Perpustakaan Saya
          </h2>
          <p className="text-muted">Buku-buku yang sudah Anda beli atau dapatkan gratis</p>
        </div>

        {/* Search & Filter */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form onSubmit={handleSearch}>
                  <InputGroup>
                    <InputGroup.Text>
                      <Search />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Cari buku di library..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button type="submit" variant="outline-success">
                      Cari
                    </Button>
                  </InputGroup>
                </Form>
              </Col>
              <Col md={3}>
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" className="w-100">
                    <SortDown className="me-2" /> Urutkan: {sortBy === 'recent' ? 'Terbaru' : 
                    sortBy === 'title' ? 'Judul A-Z' : 
                    sortBy === 'progress' ? 'Progress' : 'Rating'}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setSortBy('recent')}>Terbaru</Dropdown.Item>
                    <Dropdown.Item onClick={() => setSortBy('title')}>Judul A-Z</Dropdown.Item>
                    <Dropdown.Item onClick={() => setSortBy('progress')}>Progress Baca</Dropdown.Item>
                    <Dropdown.Item onClick={() => setSortBy('rating')}>Rating</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
              <Col md={3}>
                <Dropdown>
                  <Dropdown.Toggle variant="outline-secondary" className="w-100">
                    <Filter className="me-2" /> Filter Genre
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setFilterGenre('')}>Semua Genre</Dropdown.Item>
                    <Dropdown.Item onClick={() => setFilterGenre('1')}>Fiksi</Dropdown.Item>
                    <Dropdown.Item onClick={() => setFilterGenre('2')}>Non-Fiksi</Dropdown.Item>
                    <Dropdown.Item onClick={() => setFilterGenre('3')}>Romantis</Dropdown.Item>
                    <Dropdown.Item onClick={() => setFilterGenre('4')}>Misteri</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Book List */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
            <p className="mt-3">Memuat library...</p>
          </div>
        ) : books.length === 0 ? (
          <Card className="border-0 shadow-sm text-center py-5">
            <Card.Body>
              <Book size={48} className="text-muted mb-3" />
              <h5>Library masih kosong</h5>
              <p className="text-muted">Belum ada buku yang Anda miliki</p>
              <Button as={Link} to="/browse" variant="success" className="mt-2">
                Jelajahi Buku
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-4">
            {books.map(book => (
              <Col key={book.id} lg={3} md={4} sm={6}>
                <Card className="h-100 border-0 shadow-sm hover-shadow" style={{ transition: '0.3s' }}>
                  <div style={{ 
                    height: '200px', 
                    backgroundColor: '#f0f0f0',
                    backgroundImage: book.cover ? `url(${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${book.cover})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {!book.cover && <Book size={48} className="text-muted" />}
                    {book.readingProgress > 0 && (
                      <div className="position-absolute top-0 start-0 m-2">
                        <Badge bg="success">
                          {book.readingProgress}% dibaca
                        </Badge>
                      </div>
                    )}
                    {book.isFree && (
                      <div className="position-absolute top-0 end-0 m-2">
                        <Badge bg="warning">Gratis</Badge>
                      </div>
                    )}
                  </div>
                  <Card.Body>
                    <h6 className="fw-bold mb-2">{book.title}</h6>
                    <small className="text-muted d-block mb-2">oleh {book.author}</small>
                    
                    {book.genres && book.genres.length > 0 && (
                      <div className="mb-2">
                        {book.genres.slice(0, 2).map(genre => (
                          <Badge key={genre.id} bg="light" text="dark" className="me-1">
                            {genre.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <Star size={14} className="text-warning" />
                        <small className="ms-1">{book.rating || '0'}</small>
                        <small className="text-muted ms-2">({book.reviewCount || 0})</small>
                      </div>
                      {book.price > 0 && (
                        <Badge bg="success">Rp {book.price?.toLocaleString() || '0'}</Badge>
                      )}
                    </div>

                    {book.readingProgress > 0 ? (
                      <>
                        <div className="mb-2">
                          <small>Progress membaca</small>
                          <div className="d-flex align-items-center">
                            <div className="flex-grow-1 me-2">
                              <div className="progress" style={{ height: '6px' }}>
                                <div 
                                  className="progress-bar bg-success" 
                                  style={{ width: `${book.readingProgress}%` }}
                                ></div>
                              </div>
                            </div>
                            <small>{book.readingProgress}%</small>
                          </div>
                        </div>
                        <Button 
                          as={Link} 
                          to={`/read/${book.slug || book.id}`} 
                          variant="success" 
                          className="w-100"
                        >
                          <BookHalf className="me-1" /> Lanjut Baca
                        </Button>
                      </>
                    ) : (
                      <Button 
                        as={Link} 
                        to={`/read/${book.slug || book.id}`} 
                        variant="outline-success" 
                        className="w-100"
                      >
                        <Book className="me-1" /> Mulai Baca
                      </Button>
                    )}
                  </Card.Body>
                  <Card.Footer className="bg-transparent border-0">
                    <small className="text-muted">
                      <Clock size={12} className="me-1" />
                      Ditambahkan: {new Date(book.purchasedDate || book.created_at).toLocaleDateString('id-ID')}
                    </small>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Stats */}
        {books.length > 0 && (
          <Card className="mt-4 border-0 shadow-sm">
            <Card.Body>
              <Row>
                <Col md={3} className="text-center">
                  <h4 className="fw-bold" style={{ color: theme.primary }}>{books.length}</h4>
                  <small>Total Buku</small>
                </Col>
                <Col md={3} className="text-center">
                  <h4 className="fw-bold" style={{ color: theme.secondary }}>
                    {books.filter(b => b.readingProgress > 0).length}
                  </h4>
                  <small>Sedang Dibaca</small>
                </Col>
                <Col md={3} className="text-center">
                  <h4 className="fw-bold text-warning">
                    {books.filter(b => b.readingProgress === 100).length}
                  </h4>
                  <small>Selesai Dibaca</small>
                </Col>
                <Col md={3} className="text-center">
                  <h4 className="fw-bold text-info">
                    {books.filter(b => b.isFree).length}
                  </h4>
                  <small>Buku Gratis</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}
      </Container>
    </Container>
  );
};

export default Library;