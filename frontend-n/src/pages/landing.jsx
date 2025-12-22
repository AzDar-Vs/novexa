import { useState, useEffect } from 'react';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Book, BookmarkCheck, Star, ArrowRight, ChevronRight } from 'react-bootstrap-icons';

const Landing = () => {
  const [typedText, setTypedText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);

  const texts = [
    "Temukan buku digital terbaik",
    "Jelajahi karya penulis independen",
    "Bangun perpustakaan digitalmu",
    "Baca kapan saja, di mana saja"
  ];

  useEffect(() => {
    setFadeIn(true);
  }, []);

  useEffect(() => {
    const currentText = texts[textIndex];
    let currentChar = 0;
    
    const typingInterval = setInterval(() => {
      if (currentChar <= currentText.length) {
        setTypedText(currentText.substring(0, currentChar));
        currentChar++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setTextIndex((prev) => (prev + 1) % texts.length);
        }, 2000);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [textIndex]);

  const features = [
    {
      icon: <Book size={28} />,
      title: "Koleksi Eksklusif",
      desc: "Ribuan buku digital dari penulis terbaik"
    },
    {
      icon: <BookmarkCheck size={28} />,
      title: "Simpan & Kelola",
      desc: "Buat perpustakaan pribadi dengan mudah"
    },
    {
      icon: <star size={28} />,
      title: "Komunitas Pembaca",
      desc: "Diskusikan dengan pembaca lainnya"
    },
    {
      icon: <Star size={28} />,
      title: "Rating & Review",
      desc: "Temukan buku terbaik dari ulasan"
    }
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d2916 0%, #1a472a 30%, #2e7d32 100%)',
        color: '#f5f5dc',
        overflow: 'hidden',
        position: 'relative'
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

      {/* Floating Books Animation */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            fontSize: '24px',
            opacity: 0.1,
            animation: `float ${15 + i * 3}s infinite ease-in-out`,
            animationDelay: `${i * 2}s`,
            top: `${10 + i * 15}%`,
            left: `${i * 20}%`,
          }}
        >
          📚
        </div>
      ))}

      {/* Animated Gradient Orbs */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 195, 74, 0.2) 0%, rgba(139, 195, 74, 0) 70%)',
        top: '-150px',
        right: '-150px',
        animation: 'pulse 8s infinite ease-in-out'
      }} />

      <Container className="position-relative" style={{ zIndex: 1 }}>
        <Row className="min-vh-100 align-items-center">
          <Col lg={6} className={`py-5 ${fadeIn ? 'animate__animated animate__fadeInLeft' : ''}`}>
            <div style={{ transform: 'translateY(-20px)' }}>
              <div className="mb-4">
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '8px 16px',
                  borderRadius: '50px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#4CAF50',
                    marginRight: '8px',
                    animation: 'pulse 2s infinite'
                  }} />
                  <span className="small">🎯 Platform Buku Digital No. 1</span>
                </div>
                
                <h1 className="display-4 fw-bold mb-4" style={{
                  background: 'linear-gradient(45deg, #FFFFFF, #FFD700)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                }}>
                  Novexa
                  <span style={{
                    fontSize: '0.6em',
                    verticalAlign: 'super',
                    color: '#FFD700',
                    marginLeft: '4px'
                  }}>📚</span>
                </h1>
                
                <div className="mb-4" style={{ minHeight: '60px' }}>
                  <h2 className="h3 fw-normal">
                    <span style={{
                      borderRight: '2px solid #4CAF50',
                      paddingRight: '4px',
                      animation: 'blink 1s infinite'
                    }}>
                      {typedText}
                    </span>
                  </h2>
                </div>
                
                <p className="lead mb-5" style={{ 
                  opacity: 0.9,
                  lineHeight: 1.8
                }}>
                  Temukan, baca, dan kelola buku digital dari kreator independen.
                  Mulai perjalanan membaca Anda dengan perpustakaan digital pribadi.
                </p>
              </div>

              {/* Features Grid */}
              <Row className="g-3 mb-5">
                {features.map((feature, index) => (
                  <Col md={6} key={index} className="mb-3">
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(76, 175, 80, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}>
                      <div className="d-flex align-items-start">
                        <div style={{
                          background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                          borderRadius: '10px',
                          width: '48px',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '15px',
                          flexShrink: 0
                        }}>
                          <div style={{ color: 'white' }}>
                            {feature.icon}
                          </div>
                        </div>
                        <div>
                          <h5 className="fw-bold mb-2" style={{ color: '#FFD700' }}>
                            {feature.title}
                          </h5>
                          <p className="small mb-0" style={{ opacity: 0.8 }}>
                            {feature.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>

              {/* CTA Buttons */}
              <div className="d-flex flex-wrap gap-3 align-items-center">
                <Button
                  as={Link}
                  to="/register"
                  variant="success"
                  size="lg"
                  className="px-5 py-3 fw-bold"
                  style={{
                    background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
                    border: 'none',
                    borderRadius: '12px',
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
                  Mulai Gratis
                  <ArrowRight className="ms-2" />
                </Button>

                <Button
                  as={Link}
                  to="/login"
                  variant="outline-light"
                  size="lg"
                  className="px-5 py-3"
                  style={{
                    borderRadius: '12px',
                    borderWidth: '2px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = '#FFD700';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  Masuk ke Akun
                  <ChevronRight className="ms-2" />
                </Button>

                <div className="mt-3 w-100">
                  <p className="small text-center text-white-50 mb-0">
                    ✨ Bergabung dengan <span className="fw-bold">10.000+</span> pembaca aktif
                  </p>
                </div>
              </div>
            </div>
          </Col>

          <Col lg={6} className={`py-5 ${fadeIn ? 'animate__animated animate__fadeInRight animate__delay-1s' : ''}`}>
            <div style={{
              position: 'relative',
              height: '500px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Main Book Mockup */}
              <div style={{
                width: '280px',
                height: '400px',
                background: 'linear-gradient(145deg, #2c3e50, #4a6572)',
                borderRadius: '16px',
                position: 'relative',
                transform: 'rotateY(-10deg) rotateX(5deg)',
                boxShadow: `
                  -20px 20px 40px rgba(0, 0, 0, 0.3),
                  inset 2px 2px 10px rgba(255, 255, 255, 0.1),
                  inset -2px -2px 10px rgba(0, 0, 0, 0.3)
                `,
                animation: 'floatBook 6s ease-in-out infinite',
                zIndex: 3
              }}>
                <div style={{
                  position: 'absolute',
                  top: '30px',
                  left: '20px',
                  right: '20px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '60px',
                    height: '8px',
                    background: '#FFD700',
                    margin: '0 auto 20px',
                    borderRadius: '4px'
                  }} />
                  <h4 className="fw-bold mb-2" style={{ color: '#FFD700' }}>
                    Digital Library
                  </h4>
                  <p className="small" style={{ opacity: 0.8 }}>
                    Your personal collection
                  </p>
                </div>

                {/* Book Pages Effect */}
                <div style={{
                  position: 'absolute',
                  left: '10px',
                  top: '80px',
                  right: '10px',
                  bottom: '20px',
                  background: '#f5f5dc',
                  borderRadius: '8px',
                  padding: '20px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} style={{
                        height: '8px',
                        background: i % 2 === 0 ? '#e0e0e0' : '#f0f0f0',
                        borderRadius: '4px',
                        width: `${80 + i * 5}%`,
                        animation: `shimmer ${2 + i * 0.5}s infinite`
                      }} />
                    ))}
                  </div>
                </div>

                {/* Book Spine */}
                <div style={{
                  position: 'absolute',
                  left: '-15px',
                  top: '20px',
                  bottom: '20px',
                  width: '20px',
                  background: 'linear-gradient(to right, #1a252f, #2c3e50)',
                  borderRadius: '4px 0 0 4px',
                  transform: 'rotateY(90deg)'
                }} />
              </div>

              {/* Floating Book Elements */}
              <div style={{
                position: 'absolute',
                width: '180px',
                height: '240px',
                background: 'linear-gradient(145deg, #1a472a, #2e7d32)',
                borderRadius: '12px',
                top: '50px',
                right: '50px',
                transform: 'rotate(15deg)',
                opacity: 0.8,
                animation: 'floatBook2 8s ease-in-out infinite 1s',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                zIndex: 2
              }}>
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '15px',
                  right: '15px',
                  textAlign: 'center',
                  color: '#FFD700',
                  fontSize: '12px'
                }}>
                  📖 Buku Baru
                </div>
              </div>

              <div style={{
                position: 'absolute',
                width: '160px',
                height: '220px',
                background: 'linear-gradient(145deg, #8B4513, #A0522D)',
                borderRadius: '10px',
                bottom: '50px',
                left: '50px',
                transform: 'rotate(-10deg)',
                opacity: 0.7,
                animation: 'floatBook3 7s ease-in-out infinite 0.5s',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                zIndex: 1
              }}>
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '15px',
                  right: '15px',
                  textAlign: 'center',
                  color: '#FFD700',
                  fontSize: '12px'
                }}>
                  🏆 Best Seller
                </div>
              </div>
            </div>

            {/* Stats */}
            <Row className="mt-5 text-center">
              <Col md={4}>
                <div className="display-5 fw-bold" style={{ color: '#FFD700' }}>
                  5K+
                </div>
                <div className="small">Buku Tersedia</div>
              </Col>
              <Col md={4}>
                <div className="display-5 fw-bold" style={{ color: '#4CAF50' }}>
                  50K+
                </div>
                <div className="small">Pembaca Aktif</div>
              </Col>
              <Col md={4}>
                <div className="display-5 fw-bold" style={{ color: '#8BC34A' }}>
                  4.8
                </div>
                <div className="small">Rating App</div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      {/* Scroll Indicator */}
      <div className="text-center pb-4" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <div style={{
          animation: 'bounce 2s infinite',
          cursor: 'pointer',
          display: 'inline-block'
        }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
          <div className="small mb-2" style={{ opacity: 0.7 }}>Jelajahi lebih lanjut</div>
          <div style={{
            width: '30px',
            height: '50px',
            borderRadius: '15px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            margin: '0 auto',
            position: 'relative'
          }}>
            <div style={{
              width: '4px',
              height: '10px',
              background: '#FFD700',
              borderRadius: '2px',
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              animation: 'scroll 2s infinite'
            }} />
          </div>
        </div>
      </div>

      {/* Global Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes floatBook {
          0%, 100% { transform: rotateY(-10deg) rotateX(5deg) translateY(0); }
          50% { transform: rotateY(-10deg) rotateX(5deg) translateY(-20px); }
        }
        
        @keyframes floatBook2 {
          0%, 100% { transform: rotate(15deg) translateY(0); }
          50% { transform: rotate(15deg) translateY(-15px); }
        }
        
        @keyframes floatBook3 {
          0%, 100% { transform: rotate(-10deg) translateY(0); }
          50% { transform: rotate(-10deg) translateY(-15px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        
        @keyframes blink {
          0%, 100% { border-color: #4CAF50; }
          50% { border-color: transparent; }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @keyframes scroll {
          0% { transform: translateX(-50%) translateY(0); opacity: 1; }
          100% { transform: translateX(-50%) translateY(20px); opacity: 0; }
        }
        
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Landing;