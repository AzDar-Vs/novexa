import { useEffect, useState } from 'react';
import {
  Container, Row, Col, Card, Badge,
  Navbar, Nav, Dropdown, Spinner, Button
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import api from '../../api/axios';
import {
  Book, House, BoxSeam, Wallet,
  Bell, Person, BoxArrowRight, PlusCircle
} from 'react-bootstrap-icons';

const SellerProducts = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 stats yang tadi "belom"
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    free: 0
  });

  const theme = {
    dark: '#1a472a',
    primary: '#2e7d32',
    light: '#4caf50',
    cream: '#f5f5dc',
    gold: '#d4af37'
  };

  /* ================= FETCH SELLER BOOKS ================= */
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await api.get('/seller/books');
        const data = res.data.data || [];

        setBooks(data);

        // 🔥 hitung stats dari produk
        setStats({
          total: data.length,
          published: data.filter(b => b.STATUS === 'published').length,
          draft: data.filter(b => b.STATUS === 'draft').length,
          free: data.filter(b => b.HARGA === 0 || b.HARGA === null).length
        });
      } catch (err) {
        console.error('Gagal mengambil produk seller', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /* ================= LOADING ================= */
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
    <div style={{ minHeight: '100vh', backgroundColor: theme.cream }}>

      {/* ================= NAVBAR SELLER ================= */}
      <Navbar expand="lg" style={{ backgroundColor: theme.dark, padding: '1rem 0' }}>
        <Container>
          <Navbar.Brand as={Link} to="/seller" className="text-white fw-bold">
            <Book className="me-2" />
            Novexa Seller
          </Navbar.Brand>

          <Navbar.Toggle className="border-0">
            <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }} />
          </Navbar.Toggle>

          <Navbar.Collapse>
            <Nav className="ms-auto align-items-center">
              <Nav.Link as={Link} to="/seller" className="text-white mx-2">
                <House className="me-1" /> Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/seller/products" className="text-white mx-2 fw-bold">
                <BoxSeam className="me-1" /> Produk
              </Nav.Link>
              <Nav.Link as={Link} to="/seller/transactions" className="text-white mx-2">
                <Wallet className="me-1" /> Transaksi
              </Nav.Link>

              <Dropdown className="mx-3">
                <Dropdown.Toggle variant="outline-light" size="sm">
                  <Bell />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item disabled>Tidak ada notifikasi</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown>
                <Dropdown.Toggle variant="outline-light" size="sm">
                  <Person className="me-2" />
                  {user?.name || 'Seller'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">
                    Profil Seller
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

      {/* ================= HEADER GRADIENT ================= */}
      <div
        style={{
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.dark})`,
          padding: '3rem 0',
          color: 'white'
        }}
      >
        <Container className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">Produk Saya</h2>
            <p className="mb-0 text-light">
              Kelola semua buku yang Anda jual
            </p>
          </div>

          <Button
            as={Link}
            to="/seller/books/add"
            style={{
              backgroundColor: theme.gold,
              border: 'none',
              color: theme.dark,
              fontWeight: 'bold'
            }}
          >
            <PlusCircle className="me-2" />
            Tambah Buku
          </Button>
        </Container>
      </div>
<br/>
<br/>
<br/>
      {/* ================= QUICK STATS (INI YANG TADI BELUM) ================= */}
      <Container className="mt-n5 mb-5">
        <Row className="g-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <small className="text-muted">Total Produk</small>
                <h3 className="fw-bold">{stats.total}</h3>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <small className="text-muted">Published</small>
                <h3 className="fw-bold text-success">{stats.published}</h3>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <small className="text-muted">Draft</small>
                <h3 className="fw-bold text-warning">{stats.draft}</h3>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <small className="text-muted">Gratis</small>
                <h3 className="fw-bold text-info">{stats.free}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* ================= PRODUCT LIST ================= */}
      <Container className="pb-5">
        {books.length === 0 ? (
          <p className="text-muted text-center">Belum ada produk</p>
        ) : (
          <Row className="g-4">
            {books.map(book => (
              <Col md={6} lg={4} key={book.ID_BUKU}>
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body>
                    <Card.Title className="fw-bold">
                      {book.JUDUL}
                    </Card.Title>

                    <p className="mb-1">
                      <strong>Harga:</strong>{' '}
                      {book.HARGA === 0
                        ? <Badge bg="success">Gratis</Badge>
                        : `Rp ${Number(book.HARGA).toLocaleString('id-ID')}`}
                    </p>

                    <p>
                      <strong>Status:</strong>{' '}
                      <Badge bg={book.STATUS === 'published' ? 'success' : 'warning'}>
                        {book.STATUS}
                      </Badge>
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default SellerProducts;
