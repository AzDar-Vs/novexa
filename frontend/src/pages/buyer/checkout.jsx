import { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Form, 
  Alert, Spinner, Badge, Modal, Tab, Tabs
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getCartApi, checkoutApi } from '../../api/cart.api';
import { 
  CreditCard, Wallet, Bank, QrCode, 
  CheckCircle, ShieldCheck, Truck, ArrowLeft
} from 'react-bootstrap-icons';

const Checkout = () => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'bank_transfer',
    notes: ''
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const theme = {
    primary: '#2D5A27',
    secondary: '#4CAF50',
    accent: '#8BC34A',
    light: '#F5F5DC',
    gold: '#FFD700',
    dark: '#1A472A'
  };

  useEffect(() => {
    loadCart();
  }, []);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      alert('Harap lengkapi semua data pengiriman');
      return;
    }

    try {
      setCheckoutLoading(true);
      const response = await checkoutApi({
        ...formData,
        items: cart.items,
        total: cart.total
      });
      
      setShowSuccessModal(true);
      
      // Auto redirect setelah 3 detik
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
      
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout gagal: ' + (error.response?.data?.message || error.message));
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `Rp ${price?.toLocaleString('id-ID') || '0'}`;
  };

  const getTotalItems = () => {
    return cart.items?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;
  };

  const paymentMethods = [
    {
      id: 'bank_transfer',
      name: 'Transfer Bank',
      icon: <Bank />,
      description: 'Transfer ke rekening BCA, Mandiri, BNI, atau BRI',
      banks: [
        { name: 'BCA', number: '123-456-7890', holder: 'Novexa Books' },
        { name: 'Mandiri', number: '987-654-3210', holder: 'Novexa Books' },
        { name: 'BNI', number: '456-789-0123', holder: 'Novexa Books' }
      ]
    },
    {
      id: 'e_wallet',
      name: 'E-Wallet',
      icon: <Wallet />,
      description: 'DANA, OVO, GoPay, atau ShopeePay',
      wallets: ['DANA', 'OVO', 'GoPay', 'ShopeePay']
    },
    {
      id: 'credit_card',
      name: 'Kartu Kredit',
      icon: <CreditCard />,
      description: 'Visa, MasterCard, JCB'
    },
    {
      id: 'qris',
      name: 'QRIS',
      icon: <QrCode />,
      description: 'Scan QR code untuk pembayaran'
    }
  ];

  if (loading) {
    return (
      <Container className="py-5 text-center" style={{ backgroundColor: theme.light, minHeight: '100vh' }}>
        <Spinner animation="border" variant="success" />
        <p className="mt-3">Memuat halaman checkout...</p>
      </Container>
    );
  }

  if (cart.items?.length === 0) {
    return (
      <Container className="py-5 text-center" style={{ backgroundColor: theme.light, minHeight: '100vh' }}>
        <Card className="border-0 shadow-sm mx-auto" style={{ maxWidth: '500px' }}>
          <Card.Body className="py-5">
            <Alert variant="warning">
              <h5>Keranjang kosong</h5>
              <p>Tambahkan buku terlebih dahulu sebelum checkout</p>
              <Button as={Link} to="/cart" variant="warning">
                Kembali ke Keranjang
              </Button>
            </Alert>
          </Card.Body>
        </Card>
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
          <ArrowLeft className="me-1" /> Kembali ke Keranjang
        </Button>
        <h1 className="fw-bold" style={{ color: theme.primary }}>
          <CheckCircle className="me-2" /> Checkout
        </h1>
        <p className="text-muted">
          Lengkapi informasi berikut untuk menyelesaikan pembelian
        </p>
      </div>

      <Row className="g-4">
        {/* Left Column - Form */}
        <Col lg={8}>
          <Tabs defaultActiveKey="shipping" className="mb-4">
            {/* Tab 1: Shipping Information */}
            <Tab eventKey="shipping" title="🛒 Informasi Pengiriman">
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h5 className="mb-4">Data Pengiriman</h5>
                  <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Nama Lengkap *</Form.Label>
                          <Form.Control
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Nama penerima"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Email *</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="email@contoh.com"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Nomor Telepon *</Form.Label>
                          <Form.Control
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="08xx-xxxx-xxxx"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Kota</Form.Label>
                          <Form.Select name="city" onChange={handleInputChange}>
                            <option>Pilih Kota</option>
                            <option>Jakarta</option>
                            <option>Bandung</option>
                            <option>Surabaya</option>
                            <option>Yogyakarta</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Alamat Lengkap *</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Jl. Contoh No. 123, RT/RW, Kecamatan, Kota"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Catatan (Opsional)</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder="Catatan untuk penjual atau kurir"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            </Tab>

            {/* Tab 2: Payment Method */}
            <Tab eventKey="payment" title="💳 Metode Pembayaran">
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h5 className="mb-4">Pilih Metode Pembayaran</h5>
                  <Row className="g-3">
                    {paymentMethods.map(method => (
                      <Col md={6} key={method.id}>
                        <Card 
                          className={`border-2 ${formData.paymentMethod === method.id ? 'border-success' : 'border-light'}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))}
                        >
                          <Card.Body className="text-center">
                            <div className="fs-3 mb-2">{method.icon}</div>
                            <h6>{method.name}</h6>
                            <small className="text-muted">{method.description}</small>
                            
                            {formData.paymentMethod === method.id && (
                              <div className="mt-3">
                                {method.id === 'bank_transfer' && (
                                  <div className="text-start small">
                                    {method.banks.map(bank => (
                                      <div key={bank.name} className="mb-1">
                                        <strong>{bank.name}:</strong> {bank.number}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {method.id === 'e_wallet' && (
                                  <div className="text-start small">
                                    {method.wallets.map(wallet => (
                                      <Badge key={wallet} bg="light" text="dark" className="me-1">
                                        {wallet}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Tab>

            {/* Tab 3: Review Order */}
            <Tab eventKey="review" title="📋 Ringkasan Pesanan">
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h5 className="mb-4">Ringkasan Pesanan</h5>
                  
                  <div className="mb-4">
                    <h6>Item yang dibeli:</h6>
                    {cart.items.map(item => (
                      <div key={item.id} className="d-flex justify-content-between align-items-center border-bottom py-2">
                        <div>
                          <strong>{item.title}</strong>
                          <br />
                          <small className="text-muted">
                            {item.quantity || 1} × {formatPrice(item.price)}
                          </small>
                        </div>
                        <div className="text-end">
                          <strong>{formatPrice((item.price || 0) * (item.quantity || 1))}</strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-light p-3 rounded">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal ({getTotalItems()} item)</span>
                      <span>{formatPrice(cart.total)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Biaya Admin</span>
                      <span>Rp 0</span>
                    </div>
                    <div className="d-flex justify-content-between fw-bold fs-5">
                      <span>Total Pembayaran</span>
                      <span className="text-success">{formatPrice(cart.total)}</span>
                    </div>
                  </div>

                  <Alert variant="success" className="mt-4">
                    <ShieldCheck className="me-2" />
                    <strong>Transaksi Aman</strong>
                    <p className="mb-0 small">Pembayaran Anda dilindungi dengan enkripsi SSL 256-bit</p>
                  </Alert>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>

        {/* Right Column - Order Summary */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
            <Card.Header className="bg-white">
              <h5 className="mb-0">Detail Pembayaran</h5>
            </Card.Header>
            <Card.Body>
              {/* Order Items */}
              <div className="mb-4">
                <h6>Item ({getTotalItems()})</h6>
                {cart.items.slice(0, 3).map(item => (
                  <div key={item.id} className="d-flex align-items-center mb-2">
                    <div className="me-2" style={{ width: '40px' }}>
                      <div 
                        style={{
                          width: '40px',
                          height: '50px',
                          backgroundColor: '#f0f0f0',
                          backgroundImage: item.cover ? `url(${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${item.cover})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderRadius: '3px'
                        }}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <small className="d-block">{item.title}</small>
                      <small className="text-muted">
                        {item.quantity || 1} × {formatPrice(item.price)}
                      </small>
                    </div>
                  </div>
                ))}
                {cart.items.length > 3 && (
                  <small className="text-muted">
                    +{cart.items.length - 3} item lainnya
                  </small>
                )}
              </div>

              {/* Order Summary */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.total)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Biaya Admin</span>
                  <span>Rp 0</span>
                </div>
                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Total</span>
                  <span className="text-success">{formatPrice(cart.total)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-4">
                <h6>Metode Pembayaran</h6>
                <Badge bg="light" text="dark" className="p-2">
                  {paymentMethods.find(m => m.id === formData.paymentMethod)?.name || 'Belum dipilih'}
                </Badge>
              </div>

              {/* Terms & Conditions */}
              <Form.Check 
                type="checkbox"
                id="terms"
                label={
                  <small>
                    Saya setuju dengan <Link to="/terms">Syarat & Ketentuan</Link> dan <Link to="/privacy">Kebijakan Privasi</Link>
                  </small>
                }
                className="mb-4"
              />

              {/* Submit Button */}
              <Button 
                style={{ backgroundColor: theme.primary, border: 'none' }}
                size="lg"
                className="w-100"
                onClick={handleSubmit}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle className="me-2" />
                    Bayar Sekarang
                  </>
                )}
              </Button>

              {/* Security Info */}
              <div className="text-center mt-4">
                <ShieldCheck size={20} className="text-success me-1" />
                <small className="text-muted">Transaksi 100% Aman</small>
              </div>
            </Card.Body>
          </Card>

          {/* Support Info */}
          <Card className="border-0 shadow-sm mt-4">
            <Card.Body className="text-center">
              <Truck size={24} className="text-muted mb-2" />
              <h6>Pengiriman Cepat</h6>
              <p className="small text-muted mb-2">
                Buku digital langsung dikirim setelah pembayaran berhasil
              </p>
              <small className="text-success">Estimasi: 1-5 menit</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Success Modal */}
      <Modal show={showSuccessModal} centered>
        <Modal.Body className="text-center p-5">
          <div className="mb-4">
            <CheckCircle size={64} className="text-success" />
          </div>
          <h4 className="fw-bold mb-3">Pembayaran Berhasil!</h4>
          <p className="text-muted mb-4">
            Pesanan Anda telah berhasil diproses. Buku akan segera dikirim ke email Anda.
          </p>
          <div className="mb-4">
            <Badge bg="light" text="dark" className="p-2">
              Invoice: INV-{Date.now().toString().slice(-8)}
            </Badge>
            <div className="mt-2">
              <small>Total: <strong>{formatPrice(cart.total)}</strong></small>
            </div>
          </div>
          <div className="d-grid gap-2">
            <Button 
              as={Link}
              to="/orders"
              style={{ backgroundColor: theme.primary, border: 'none' }}
            >
              Lihat Pesanan Saya
            </Button>
            <Button 
              as={Link}
              to="/explore"
              variant="outline-success"
            >
              Beli Buku Lain
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Checkout;