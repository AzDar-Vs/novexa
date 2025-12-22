import { Container, Row, Col, Card, Button, Badge, ProgressBar, Nav, Navbar, Dropdown, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useEffect, useState } from 'react';
import { getBuyerDashboardApi } from '../../api/buyer.api';
import { 
  Book, Cart, Star, GraphUp, ClockHistory, Person, BoxArrowRight, 
  Bell, Search, House, BookHalf, Cash, Plus, Eye, ArrowRight,
  CheckCircle, FileText, Clock
} from 'react-bootstrap-icons';

const BuyerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const theme = {
    primary: '#2D5A27',
    secondary: '#4CAF50',
    accent: '#8BC34A',
    light: '#F5F5DC',
    gold: '#FFD700',
    warning: '#FF9800',
    dark: '#1A472A'
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const res = await getBuyerDashboardApi();
        
        if (res.data.success) {
          setStats(res.data.data.stats);
          setRecentBooks(res.data.data.recentBooks);
          setRecentActivities(res.data.data.recentActivities);
          setNotifications(res.data.data.notifications || []);
        }
      } catch (err) {
        console.error('Dashboard error', err);
        // Tampilkan empty state jika error
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="success" />
        <span className="ms-3">Memuat dashboard...</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.light }}>
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
                {stats?.cartItems > 0 && (
                  <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
                    {stats.cartItems}
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
                  {user?.name?.split(' ')[0] || 'User'}
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

      {/* MAIN CONTENT */}
      <Container fluid className="px-3 px-md-4 py-4">
        {/* WELCOME & QUICK STATS */}
        <Row className="mb-4">
          <Col lg={8}>
            <Card className="border-0 shadow-sm" style={{ backgroundColor: 'white' }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h4 className="fw-bold mb-1" style={{ color: theme.primary }}>
                      Selamat datang, {user?.name || 'Pembaca'}! 📚
                    </h4>
                    <p className="text-muted mb-3">
                      {stats?.libraryCount > 0 
                        ? `Anda memiliki ${stats.libraryCount} buku di perpustakaan` 
                        : 'Mulai bangun perpustakaan digital Anda'}
                    </p>
                    
                    <div className="d-flex gap-3">
                      {stats?.purchasedCount > 0 && (
                        <Badge bg="success" className="p-2">
                          <CheckCircle className="me-1" /> {stats.purchasedCount} buku berbayar
                        </Badge>
                      )}
                      {stats?.freeBooksCount > 0 && (
                        <Badge bg="info" className="p-2">
                          <Book className="me-1" /> {stats.freeBooksCount} buku gratis
                        </Badge>
                      )}
                      {stats?.booksCompleted > 0 && (
                        <Badge bg="warning" className="p-2">
                          <Star className="me-1" /> {stats.booksCompleted} selesai dibaca
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button as={Link} to="/browse" style={{ backgroundColor: theme.accent, border: 0 }}>
                    <Plus className="me-1" /> Tambah Buku
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            <Card className="border-0 shadow-sm" style={{ backgroundColor: theme.gold, color: theme.dark }}>
              <Card.Body className="text-center">
                <h6 className="mb-2">Saldo Pembaca</h6>
                <h2 className="fw-bold mb-0">Rp {(user?.saldo || 0).toLocaleString()}</h2>
                <small>Saldo tersedia untuk pembelian</small>
                <Button 
                  variant="outline-dark" 
                  size="sm" 
                  className="mt-2"
                  as={Link}
                  to="/buyer/topup"
                >
                  <Cash className="me-1" /> Top Up Saldo
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* DETAILED STATS */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100" style={{ backgroundColor: theme.primary, color: 'white' }}>
              <Card.Body className="text-center">
                <Book size={30} className="mb-2" />
                <h5>Total Buku</h5>
                <h2 className="fw-bold">{stats?.libraryCount || 0}</h2>
                <small>{stats?.booksCompleted || 0} selesai dibaca</small>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100" style={{ backgroundColor: theme.secondary, color: 'white' }}>
              <Card.Body className="text-center">
                <BookHalf size={30} className="mb-2" />
                <h5>Progress Baca</h5>
                <h2 className="fw-bold">{stats?.readingProgress || 0}%</h2>
                <ProgressBar 
                  now={stats?.readingProgress || 0} 
                  variant="light" 
                  className="mt-2"
                  style={{ height: '6px' }}
                />
                <small className="d-block mt-1">{stats?.booksInProgress || 0} dalam proses</small>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100" style={{ backgroundColor: theme.accent }}>
              <Card.Body className="text-center">
                <Cart size={30} className="mb-2" />
                <h5>Keranjang</h5>
                <h2 className="fw-bold">{stats?.cartItems || 0}</h2>
                <small>Total: Rp {(stats?.cartTotal || 0).toLocaleString()}</small>
                <Button 
                  variant="outline-dark" 
                  size="sm" 
                  className="mt-2 w-100"
                  as={Link}
                  to="/cart"
                >
                  <Eye className="me-1" /> Lihat Keranjang
                </Button>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100" style={{ backgroundColor: theme.warning, color: 'white' }}>
              <Card.Body className="text-center">
                <Star size={30} className="mb-2" />
                <h5>Review</h5>
                <h2 className="fw-bold">{stats?.reviewCount || 0}</h2>
                <small>Rating: {stats?.avgRating || 0}/5</small>
                <Button 
                  variant="outline-light" 
                  size="sm" 
                  className="mt-2 w-100"
                  as={Link}
                  to="/buyer/reviews"
                >
                  <FileText className="me-1" /> Lihat Review
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* RECENT BOOKS & ACTIVITIES */}
        <Row className="g-4">
          {/* RECENT BOOKS */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header style={{ backgroundColor: theme.light }}>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">
                    <Book className="me-2" /> Buku Terbaru
                  </h5>
                  <Link to="/buyer/library" className="text-decoration-none">
                    Lihat Semua <ArrowRight />
                  </Link>
                </div>
              </Card.Header>
              <Card.Body>
                {recentBooks.length > 0 ? (
                  <Row>
                    {recentBooks.map(book => (
                      <Col md={6} key={book.id} className="mb-3">
                        <Card className="h-100 border">
                          <Card.Body>
                            <div className="d-flex">
                              <div className="me-3" style={{ width: '60px', height: '80px', backgroundColor: '#eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {book.cover ? (
                                  <img 
                                    src={book.cover} 
                                    alt={book.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                                  />
                                ) : (
                                  <Book size={30} />
                                )}
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="fw-bold mb-1">{book.title}</h6>
                                <small className="text-muted d-block mb-2">oleh {book.author}</small>
                                <div className="d-flex justify-content-between align-items-center">
                                  <ProgressBar 
                                    now={book.progress} 
                                    style={{ width: '70%', height: '6px' }}
                                    variant="success"
                                  />
                                  <small className="ms-2">{book.progress}%</small>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="outline-success" 
                                  className="mt-2 w-100"
                                  as={Link}
                                  to={`/read/${book.slug || book.id}`}
                                >
                                  {book.progress > 0 ? 'Lanjut Baca' : 'Mulai Baca'}
                                </Button>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <div className="text-center py-4">
                    <Book size={48} className="text-muted mb-3" />
                    <p className="text-muted">Belum ada buku di perpustakaan</p>
                    <Button as={Link} to="/browse" variant="success">
                      Jelajahi Buku
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          {/* RECENT ACTIVITIES */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header style={{ backgroundColor: theme.light }}>
                <h5 className="mb-0 fw-bold">
                  <ClockHistory className="me-2" /> Aktivitas Terbaru
                </h5>
              </Card.Header>
              <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div key={index} className="d-flex mb-3 pb-3 border-bottom">
                      <div className="me-3">
                        {activity.action === 'membaca' && <BookHalf size={20} className="text-primary" />}
                        {activity.action === 'review' && <Star size={20} className="text-warning" />}
                        {activity.action === 'purchase' && <Cart size={20} className="text-success" />}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between">
                          <strong className="text-capitalize">{activity.action}</strong>
                          <small className="text-muted">{activity.time}</small>
                        </div>
                        <small className="text-muted d-block">{activity.bookTitle}</small>
                        {activity.action === 'membaca' && (
                          <small>Progress: {activity.progress}%</small>
                        )}
                        {activity.action === 'review' && (
                          <small>Rating: {activity.progress}/5</small>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <ClockHistory size={32} className="text-muted mb-2" />
                    <p className="text-muted">Belum ada aktivitas</p>
                  </div>
                )}
                <Button 
                  variant="outline-primary" 
                  className="w-100"
                  as={Link}
                  to="/buyer/activity"
                >
                  Lihat Semua Aktivitas
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* READING TIME */}
        {stats?.readingTime > 0 && (
          <Row className="mt-4">
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="fw-bold mb-1">
                        <Clock className="me-2" /> Waktu Membaca
                      </h5>
                      <p className="text-muted mb-0">
                        Estimasi total waktu membaca Anda
                      </p>
                    </div>
                    <div className="text-end">
                      <h2 className="fw-bold mb-0" style={{ color: theme.primary }}>
                        {stats.readingTime} jam
                      </h2>
                      <small className="text-success">
                        {stats.booksCompleted} buku selesai
                      </small>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>

      {/* FOOTER */}
      <footer className="mt-5 py-3" style={{ backgroundColor: theme.primary, color: 'white' }}>
        <Container>
          <div className="text-center">
            <small>
              © {new Date().getFullYear()} Novexa. All rights reserved.
            </small>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default BuyerDashboard;