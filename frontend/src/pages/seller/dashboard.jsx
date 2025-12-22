import { useEffect, useState } from 'react';
import {
  Container, Row, Col, Card, Button, Badge,
  Navbar, Nav, Dropdown, Spinner
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import api from '../../api/axios';
import {
  Book, House, Search, BookHalf, Cart, 
  Bell, Person, ClockHistory, Star, BoxArrowRight,
  PlusCircle, Wallet,
  BoxSeam, Gear, Eye
} from 'react-bootstrap-icons';

const SellerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk navbar
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const theme = {
    dark: '#1a472a',
    primary: '#2e7d32',
    light: '#4caf50',
    cream: '#f5f5dc',
    gold: '#d4af37',
    blue: '#004085',
    warning: '#856404',
    secondary: '#6c757d'
  };

  /* ================= FETCH DASHBOARD ================= */
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/seller/dashboard');

        setStats(res.data.data.stats);
        setTopProducts(res.data.data.topProducts || []);
        setPendingOrders(res.data.data.pendingOrders || []);
        setRecentActivities(res.data.data.recentActivities || []);
      } catch (err) {
        console.warn('Seller dashboard API not ready, fallback used');

        // Fallback data
        setStats({
          totalSales: 0,
          salesGrowth: 0,
          totalProducts: 0,
          activeProducts: 0,
          pendingOrders: 0,
          totalRevenue: 0,
          customerCount: 0,
          rating: 0
        });

        setTopProducts([]);
        setPendingOrders([]);
        setRecentActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    loadNavbarData();
  }, []);

  // Fungsi untuk load data navbar
  const loadNavbarData = () => {
    // Simulasi notifikasi untuk seller
    const mockNotifications = [
      { id: 1, title: 'Pesanan Baru', message: 'Pesanan #1234 dari John Doe', time: '5 menit lalu', isRead: false },
      { id: 2, title: 'Review Produk', message: 'Produk Anda mendapatkan rating 5 bintang', time: '1 jam lalu', isRead: true },
      { id: 3, title: 'Pembayaran Diterima', message: 'Pembayaran untuk pesanan #1234 telah diterima', time: '2 hari lalu', isRead: true }
    ];
    setNotifications(mockNotifications);
    setUnreadNotifications(mockNotifications.filter(n => !n.isRead).length);
  };

  // Fungsi untuk logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: theme.cream,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  return (
    <Container fluid className="px-0" style={{ backgroundColor: theme.cream, minHeight: '100vh' }}>
      
      {/* NAVBAR SELLER */}
      <Navbar expand="lg" style={{ backgroundColor: theme.dark, padding: '1rem 0' }}>
        <Container>
          <Navbar.Brand as={Link} to="/seller" className="text-white fw-bold">
            <Book className="me-2" size={20} />
            Novexa Seller
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="seller-navbar-nav" className="border-0">
            <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
          </Navbar.Toggle>
          
          <Navbar.Collapse id="seller-navbar-nav">
            <Nav className="ms-auto align-items-center">
              <Nav.Link as={Link} to="/seller" className="text-white mx-2 fw-bold">
                <House className="me-1" /> Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/seller/products" className="text-white mx-2">
                <BoxSeam className="me-1" /> Produk
              </Nav.Link>
              <Nav.Link as={Link} to="/seller/orders" className="text-white mx-2">
                <Star className="me-1" /> Pesanan
              </Nav.Link>
              <Nav.Link as={Link} to="/seller/transactions" className="text-white mx-2">
                <Wallet className="me-1" /> Transaksi
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
                  <Dropdown.Header>Notifikasi Seller</Dropdown.Header>
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <Dropdown.Item 
                        key={notif.id} 
                        className={!notif.isRead ? 'fw-bold' : ''}
                        as={Link}
                        to="/seller/notifications"
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
                  <Dropdown.Item as={Link} to="/seller/notifications">Lihat Semua</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              
              {/* User Dropdown */}
              <Dropdown>
                <Dropdown.Toggle variant="outline-light" size="sm">
                  <Person className="me-2" />
                  {user?.nama?.split(' ')[0] || user?.name?.split(' ')[0] || 'Seller'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">
                    <Person className="me-2" /> Profil Seller
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/seller/settings">
                    <Gear className="me-2" /> Pengaturan
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/seller/analytics">
                    <Star className="me-2" /> Analytics
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
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-5 pt-3">
          <div>
            <h2 className="fw-bold mb-2" style={{ color: theme.dark }}>
              Selamat Datang, {user?.name || 'Seller'} 👋
            </h2>
            <p className="text-muted mb-0">
              Kelola toko Anda dan pantau kinerja penjualan secara real-time
            </p>
          </div>

          <div className="d-flex gap-3">
            <Button
              as={Link}
              to="/browse"
              variant="outline-primary"
              className="d-flex align-items-center"
            >
              <Search className="me-2" /> Lihat Marketplace
            </Button>
            <Button
              as={Link}
              to="/seller/products"
              style={{ 
                backgroundColor: theme.gold, 
                border: 'none', 
                color: theme.dark,
                fontWeight: 'bold'
              }}
              className="d-flex align-items-center"
            >
              <PlusCircle className="me-2" /> Tambah Produk
            </Button>
          </div>
        </div>

        {/* QUICK STATS ROW */}
        <Row className="g-4 mb-5">
          <Col xl={3} lg={6} md={6}>
            <Card className="border-0 shadow-sm h-100" style={{ 
              borderLeft: `5px solid ${theme.blue}`,
              borderRadius: '12px'
            }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <small className="text-muted d-block mb-1">Total Penghasilan</small>
                    <h3 className="fw-bold mb-0" style={{ color: theme.blue }}>
                      {formatCurrency(stats.totalRevenue)}
                    </h3>
                    <small className="text-success">
                      <Star className="me-1" /> +{stats.salesGrowth}% dari bulan lalu
                    </small>
                  </div>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${theme.blue}20, ${theme.blue}40)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Wallet size={24} style={{ color: theme.blue }} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} md={6}>
            <Card className="border-0 shadow-sm h-100" style={{ 
              borderLeft: `5px solid ${theme.primary}`,
              borderRadius: '12px'
            }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <small className="text-muted d-block mb-1">Total Produk</small>
                    <h3 className="fw-bold mb-0" style={{ color: theme.primary }}>
                      {stats.totalProducts}
                    </h3>
                    <small className="text-muted">
                      {stats.activeProducts} aktif • {stats.totalProducts - stats.activeProducts} tidak aktif
                    </small>
                  </div>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${theme.primary}20, ${theme.primary}40)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BoxSeam size={24} style={{ color: theme.primary }} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} md={6}>
            <Card className="border-0 shadow-sm h-100" style={{ 
              borderLeft: `5px solid ${theme.light}`,
              borderRadius: '12px'
            }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <small className="text-muted d-block mb-1">Total Penjualan</small>
                    <h3 className="fw-bold mb-0" style={{ color: theme.light }}>
                      {stats.totalSales}
                    </h3>
                    <small className="text-muted">
                      {stats.customerCount} pelanggan
                    </small>
                  </div>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${theme.light}20, ${theme.light}40)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Star size={24} style={{ color: theme.light }} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} md={6}>
            <Card className="border-0 shadow-sm h-100" style={{ 
              borderLeft: `5px solid ${theme.warning}`,
              borderRadius: '12px'
            }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <small className="text-muted d-block mb-1">Pesanan Tertunda</small>
                    <h3 className="fw-bold mb-0" style={{ color: theme.warning }}>
                      {stats.pendingOrders}
                    </h3>
                    <small className="text-muted">
                      Butuh perhatian segera
                    </small>
                  </div>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${theme.warning}20, ${theme.warning}40)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ClockHistory size={24} style={{ color: theme.warning }} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Sisanya tetap sama, hanya ganti Package dengan BoxSeam di bagian Top Products */}
        {/* ... (kode lainnya tetap sama) */}
      </Container>
    </Container>
  );
};

export default SellerDashboard;