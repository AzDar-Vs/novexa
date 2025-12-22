import { useState } from 'react';
import { Container, Form, Button, Alert, Spinner, Row, Col, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { registerApi } from '../../api/auth.api';
import { Book, Person, Envelope, Lock, CheckCircle, ArrowRight, Eye, EyeSlash } from 'react-bootstrap-icons';

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });

    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const getStrengthColor = (strength) => {
    if (strength === 0) return '#dc3545';
    if (strength === 1) return '#dc3545';
    if (strength === 2) return '#ffc107';
    if (strength === 3) return '#198754';
    if (strength === 4) return '#198754';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Kata sandi dan konfirmasi kata sandi tidak cocok');
      return;
    }

    setLoading(true);

    try {
      await registerApi({
        nama: form.nama,
        email: form.email,
        password: form.password,
        role: form.role
      });
      
      setSuccess('Registrasi berhasil! Mengalihkan ke halaman login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
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
            right: `${i * 25}%`,
          }}
        >
          📚
        </div>
      ))}

      <Container className="py-5">
        <Row className="min-vh-100 align-items-center justify-content-center">
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
                    Buat Akun Baru
                  </h3>
                  <p className="text-muted">
                    Bergabung dengan komunitas pembaca Novexa
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

                {success && (
                  <Alert variant="success" className="border-0" style={{
                    background: 'rgba(25, 135, 84, 0.1)',
                    borderLeft: '4px solid #198754'
                  }}>
                    <div className="d-flex align-items-center">
                      <CheckCircle className="me-2" />
                      <div>{success}</div>
                    </div>
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold" style={{ color: '#1a472a' }}>
                          <Person className="me-2" /> Nama Lengkap
                        </Form.Label>
                        <div style={{ position: 'relative' }}>
                          <Form.Control
                            name="nama"
                            value={form.nama}
                            onChange={handleChange}
                            required
                            placeholder="Nama Anda"
                            style={{
                              paddingLeft: '50px',
                              height: '56px',
                              borderRadius: '12px',
                              border: '2px solid #e0e0e0',
                              fontSize: '16px',
                              transition: 'all 0.3s ease'
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#6c757d'
                          }}>
                            <Person size={20} />
                          </div>
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold" style={{ color: '#1a472a' }}>
                          <Envelope className="me-2" /> Email
                        </Form.Label>
                        <div style={{ position: 'relative' }}>
                          <Form.Control
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            placeholder="nama@email.com"
                            style={{
                              paddingLeft: '50px',
                              height: '56px',
                              borderRadius: '12px',
                              border: '2px solid #e0e0e0',
                              fontSize: '16px',
                              transition: 'all 0.3s ease'
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#6c757d'
                          }}>
                            <Envelope size={20} />
                          </div>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold" style={{ color: '#1a472a' }}>
                      <Lock className="me-2" /> Kata Sandi
                    </Form.Label>
                    <div style={{ position: 'relative' }}>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        placeholder="Minimal 8 karakter"
                        style={{
                          paddingLeft: '50px',
                          paddingRight: '50px',
                          height: '56px',
                          borderRadius: '12px',
                          border: '2px solid #e0e0e0',
                          fontSize: '16px',
                          transition: 'all 0.3s ease'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6c757d'
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
                    
                    {/* Password Strength Indicator */}
                    {form.password && (
                      <div className="mt-3">
                        <div className="d-flex justify-content-between mb-1">
                          <small className="fw-bold">Kekuatan kata sandi:</small>
                          <small style={{ color: getStrengthColor(passwordStrength) }}>
                            {passwordStrength === 0 ? 'Sangat Lemah' :
                             passwordStrength === 1 ? 'Lemah' :
                             passwordStrength === 2 ? 'Sedang' :
                             passwordStrength === 3 ? 'Kuat' : 'Sangat Kuat'}
                          </small>
                        </div>
                        <div style={{
                          height: '6px',
                          background: '#e9ecef',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${passwordStrength * 25}%`,
                            height: '100%',
                            background: getStrengthColor(passwordStrength),
                            borderRadius: '3px',
                            transition: 'all 0.3s ease'
                          }} />
                        </div>
                        <div className="mt-2">
                          <small className="text-muted">
                            • Minimal 8 karakter<br/>
                            • Kombinasi huruf besar dan kecil<br/>
                            • Angka dan simbol
                          </small>
                        </div>
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold" style={{ color: '#1a472a' }}>
                      <Lock className="me-2" /> Konfirmasi Kata Sandi
                    </Form.Label>
                    <div style={{ position: 'relative' }}>
                      <Form.Control
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Ketik ulang kata sandi"
                        style={{
                          paddingLeft: '50px',
                          paddingRight: '50px',
                          height: '56px',
                          borderRadius: '12px',
                          border: form.confirmPassword && form.password !== form.confirmPassword 
                            ? '2px solid #dc3545' 
                            : '2px solid #e0e0e0',
                          fontSize: '16px',
                          transition: 'all 0.3s ease'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6c757d'
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
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                      </Button>
                    </div>
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                      <small className="text-danger mt-2 d-block">
                        ❌ Kata sandi tidak cocok
                      </small>
                    )}
                    {form.confirmPassword && form.password === form.confirmPassword && (
                      <small className="text-success mt-2 d-block">
                        ✅ Kata sandi cocok
                      </small>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-5">
                    <Form.Label className="fw-bold" style={{ color: '#1a472a' }}>
                      Daftar Sebagai
                    </Form.Label>
                    <div className="d-flex gap-3">
                      {[
                        { value: 'buyer', label: 'Pembaca', desc: 'Membaca dan koleksi buku' },
                        { value: 'seller', label: 'Penulis', desc: 'Publikasi dan jual buku' },
                        { value: 'admin', label: 'Admin', desc: 'Kelola platform' }
                      ].map((role) => (
                        <div
                          key={role.value}
                          style={{
                            flex: 1,
                            border: `2px solid ${form.role === role.value ? '#4CAF50' : '#e0e0e0'}`,
                            borderRadius: '12px',
                            padding: '20px',
                            background: form.role === role.value 
                              ? 'rgba(76, 175, 80, 0.05)' 
                              : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onClick={() => setForm({ ...form, role: role.value })}
                        >
                          <div className="text-center">
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '10px',
                              background: form.role === role.value 
                                ? '#4CAF50' 
                                : '#e0e0e0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 10px'
                            }}>
                              <span style={{ color: 'white', fontSize: '18px' }}>
                                {role.value === 'buyer' ? '👤' : 
                                 role.value === 'seller' ? '✍️' : '⚙️'}
                              </span>
                            </div>
                            <h6 className="fw-bold mb-1">{role.label}</h6>
                            <small className="text-muted">{role.desc}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                    <input type="hidden" name="role" value={form.role} />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      label={
                        <span className="text-muted">
                          Saya menyetujui{' '}
                          <Link to="/terms" style={{ color: '#4CAF50' }}>
                            Syarat & Ketentuan
                          </Link>{' '}
                          dan{' '}
                          <Link to="/privacy" style={{ color: '#4CAF50' }}>
                            Kebijakan Privasi
                          </Link>
                        </span>
                      }
                      required
                    />
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
                        Membuat Akun...
                      </>
                    ) : (
                      <>
                        Daftar Sekarang <ArrowRight className="ms-2" />
                      </>
                    )}
                  </Button>

                  <div className="text-center mt-5 pt-3 border-top">
                    <p className="text-muted mb-0">
                      Sudah punya akun?{' '}
                      <Link 
                        to="/login" 
                        className="fw-bold"
                        style={{
                          color: '#4CAF50',
                          textDecoration: 'none'
                        }}
                      >
                        Masuk di sini
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
                  Bergabung dengan Kami
                </h1>
                
                <p className="lead mb-4" style={{ opacity: 0.9 }}>
                  Mulai perjalanan membaca Anda dan temukan dunia literasi yang tak terbatas.
                </p>

                <div className="mt-5">
                  <div className="d-flex align-items-center mb-4">
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: 'rgba(76, 175, 80, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '15px'
                    }}>
                      <CheckCircle size={14} color="#4CAF50" />
                    </div>
                    <div>
                      <h5 className="mb-1">Akses Gratis Selamanya</h5>
                      <p className="small mb-0 opacity-75">Tidak ada biaya pendaftaran</p>
                    </div>
                  </div>

                  <div className="d-flex align-items-center mb-4">
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: 'rgba(76, 175, 80, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '15px'
                    }}>
                      <CheckCircle size={14} color="#4CAF50" />
                    </div>
                    <div>
                      <h5 className="mb-1">Koleksi Buku Terlengkap</h5>
                      <p className="small mb-0 opacity-75">Ribuan judul dari berbagai genre</p>
                    </div>
                  </div>

                  <div className="d-flex align-items-center mb-4">
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: 'rgba(76, 175, 80, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '15px'
                    }}>
                      <CheckCircle size={14} color="#4CAF50" />
                    </div>
                    <div>
                      <h5 className="mb-1">Baca Offline</h5>
                      <p className="small mb-0 opacity-75">Unduh dan baca kapan saja</p>
                    </div>
                  </div>

                  <div className="d-flex align-items-center">
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: 'rgba(76, 175, 80, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '15px'
                    }}>
                      <CheckCircle size={14} color="#4CAF50" />
                    </div>
                    <div>
                      <h5 className="mb-1">Dukungan 24/7</h5>
                      <p className="small mb-0 opacity-75">Tim support siap membantu</p>
                    </div>
                  </div>
                </div>
              </div>
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

export default Register;