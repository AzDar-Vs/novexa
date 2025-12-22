import { useState } from 'react';
import { Container, Form, Button, Alert, Spinner, Row, Col, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { Book, Envelope, Lock, ArrowRight, Eye, EyeSlash } from 'react-bootstrap-icons';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoverEmail, setHoverEmail] = useState(false);
  const [hoverPassword, setHoverPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Email atau password salah. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d2916 0%, #1a472a 30%, #2e7d32 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Elements */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle at 20% 80%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.05) 0%, transparent 50%)`,
      }} />

      {/* Floating Books */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            fontSize: '24px',
            opacity: 0.1,
            animation: `float ${15 + i * 3}s infinite ease-in-out`,
            animationDelay: `${i * 2}s`,
            top: `${10 + i * 20}%`,
            left: `${i * 25}%`,
          }}
        >
          📚
        </div>
      ))}

      <Container className="py-5">
        <Row className="min-vh-100 align-items-center justify-content-center">
          <Col lg={6} className="d-none d-lg-block">
            <div className="text-white p-5">
              <div className="mb-5">
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '12px 24px',
                  borderRadius: '50px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  marginBottom: '30px'
                }}>
                  <Book size={24} className="me-2" />
                  <h4 className="mb-0">Novexa</h4>
                </div>
                
                <h1 className="display-4 fw-bold mb-4" style={{
                  background: 'linear-gradient(45deg, #FFFFFF, #FFD700)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                }}>
                  Selamat Datang Kembali
                </h1>
                
                <p className="lead mb-4" style={{ opacity: 0.9 }}>
                  Masuk ke akun Anda untuk melanjutkan petualangan membaca di dunia literasi digital.
                </p>

                <div className="mt-5">
                  <div className="d-flex align-items-center mb-4">
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'rgba(76, 175, 80, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '15px'
                    }}>
                      <span className="text-success">📖</span>
                    </div>
                    <div>
                      <h5 className="mb-1">Akses Tak Terbatas</h5>
                      <p className="small mb-0 opacity-75">Ribuan buku digital menunggu</p>
                    </div>
                  </div>

                  <div className="d-flex align-items-center mb-4">
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'rgba(255, 215, 0, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '15px'
                    }}>
                      <span className="text-warning">⭐</span>
                    </div>
                    <div>
                      <h5 className="mb-1">Personal Library</h5>
                      <p className="small mb-0 opacity-75">Kelola koleksi pribadi Anda</p>
                    </div>
                  </div>

                  <div className="d-flex align-items-center">
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'rgba(139, 195, 74, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '15px'
                    }}>
                      <span className="text-accent">👥</span>
                    </div>
                    <div>
                      <h5 className="mb-1">Komunitas Aktif</h5>
                      <p className="small mb-0 opacity-75">Bergabung dengan pembaca lainnya</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          <Col lg={6} md={10} sm={12}>
            <Card className="border-0 shadow-lg" style={{
              borderRadius: '20px',
              overflow: 'hidden',
              backdropFilter: 'blur(10px)',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <Card.Body className="p-5">
                <div className="text-center mb-5">
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)'
                  }}>
                    <Book size={36} color="white" />
                  </div>
                  <h3 className="fw-bold mb-2" style={{ color: '#1a472a' }}>
                    Masuk ke Akun
                  </h3>
                  <p className="text-muted">
                    Masukkan kredensial Anda untuk melanjutkan
                  </p>
                </div>

                {error && (
                  <Alert variant="danger" className="border-0" style={{
                    background: 'rgba(220, 53, 69, 0.1)',
                    borderLeft: '4px solid #dc3545'
                  }}>
                    <div className="d-flex align-items-center">
                      <div className="me-2">⚠️</div>
                      <div>{error}</div>
                    </div>
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold" style={{ color: '#1a472a' }}>
                      <Envelope className="me-2" /> Alamat Email
                    </Form.Label>
                    <div style={{
                      position: 'relative',
                      transition: 'all 0.3s ease'
                    }}>
                      <Form.Control
                        type="email"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                          paddingLeft: '50px',
                          height: '56px',
                          borderRadius: '12px',
                          border: `2px solid ${hoverEmail ? '#4CAF50' : '#e0e0e0'}`,
                          fontSize: '16px',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={() => setHoverEmail(true)}
                        onMouseLeave={() => setHoverEmail(false)}
                      />
                      <div style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: hoverEmail ? '#4CAF50' : '#6c757d'
                      }}>
                        <Envelope size={20} />
                      </div>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold" style={{ color: '#1a472a' }}>
                      <Lock className="me-2" /> Kata Sandi
                    </Form.Label>
                    <div style={{
                      position: 'relative',
                      transition: 'all 0.3s ease'
                    }}>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                          paddingLeft: '50px',
                          paddingRight: '50px',
                          height: '56px',
                          borderRadius: '12px',
                          border: `2px solid ${hoverPassword ? '#4CAF50' : '#e0e0e0'}`,
                          fontSize: '16px',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={() => setHoverPassword(true)}
                        onMouseLeave={() => setHoverPassword(false)}
                      />
                      <div style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: hoverPassword ? '#4CAF50' : '#6c757d'
                      }}>
                        <Lock size={20} />
                      </div>
                      <Button
                        variant="link"
                        style={{
                          position: 'absolute',
                          right: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#6c757d',
                          padding: 0
                        }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                      </Button>
                    </div>
                    <div className="text-end mt-2">
                      <Link to="/forgot-password" style={{
                        color: '#4CAF50',
                        textDecoration: 'none',
                        fontSize: '14px'
                      }}>
                        Lupa kata sandi?
                      </Link>
                    </div>
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="success"
                    disabled={loading}
                    className="w-100 py-3 fw-bold"
                    style={{
                      borderRadius: '12px',
                      background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
                      border: 'none',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.4)';
                    }}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        Masuk <ArrowRight className="ms-2" />
                      </>
                    )}
                  </Button>

                  <div className="text-center mt-4">
                    <p className="text-muted mb-3">
                      Atau lanjutkan dengan
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                      <Button
                        variant="outline-secondary"
                        className="rounded-circle"
                        style={{
                          width: '50px',
                          height: '50px',
                          border: '2px solid #e0e0e0'
                        }}
                      >
                        G
                      </Button>
                      <Button
                        variant="outline-secondary"
                        className="rounded-circle"
                        style={{
                          width: '50px',
                          height: '50px',
                          border: '2px solid #e0e0e0'
                        }}
                      >
                        f
                      </Button>
                      <Button
                        variant="outline-secondary"
                        className="rounded-circle"
                        style={{
                          width: '50px',
                          height: '50px',
                          border: '2px solid #e0e0e0'
                        }}
                      >
                        in
                      </Button>
                    </div>
                  </div>

                  <div className="text-center mt-5 pt-3 border-top">
                    <p className="text-muted mb-0">
                      Belum punya akun?{' '}
                      <Link 
                        to="/register" 
                        className="fw-bold"
                        style={{
                          color: '#4CAF50',
                          textDecoration: 'none'
                        }}
                      >
                        Daftar Sekarang
                      </Link>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            <div className="text-center mt-4">
              <p className="text-white small">
                © 2025 Novexa. Semua hak dilindungi.
              </p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}

export default Login;