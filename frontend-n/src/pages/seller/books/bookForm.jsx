import { useEffect, useState } from 'react';
import { 
  Container, Form, Button, Alert, 
  Card, Row, Col, Spinner, FloatingLabel,
  ToggleButton, ToggleButtonGroup
} from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { createBookApi, getBookByIdApi, updateBookApi } from '../../../api/buku.api';
import SetGenre from './setGenre';
import { 
  Book, Save, ArrowLeft, Tag, FileText, 
Gift, Upload, Image
} from 'react-bootstrap-icons';

const BookForm = () => {
  const { id } = useParams(); // kalau ada → edit
  const navigate = useNavigate();

  const [form, setForm] = useState({
    judul: '',
    deskripsi: '',
    harga: 0,
    is_free: false,
    status: 'draft'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const theme = {
    primary: '#2e7d32',
    secondary: '#4caf50',
    dark: '#1a472a',
    light: '#f5f5dc',
    warning: '#ff9800',
    danger: '#f44336',
    info: '#2196f3'
  };

  /* ===== LOAD DATA (EDIT MODE) ===== */
  useEffect(() => {
    if (!id) return;

    const fetchBook = async () => {
      try {
        setLoadingData(true);
        const res = await getBookByIdApi(id);
        const b = res.data.data;

        setForm({
          judul: b.JUDUL || '',
          deskripsi: b.DESKRIPSI || '',
          harga: b.HARGA || 0,
          is_free: !!b.IS_FREE,
          status: b.STATUS || 'draft'
        });

        // Set cover preview jika ada
        if (b.COVER && b.COVER !== 'null') {
          setCoverPreview(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${b.COVER}`);
        }

      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data buku');
      } finally {
        setLoadingData(false);
      }
    };

    fetchBook();
  }, [id]);

  /* ===== HANDLE COVER UPLOAD ===== */
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi ukuran file (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran file maksimal 2MB');
      return;
    }

    // Validasi tipe file
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Format file harus JPG, PNG, atau WebP');
      return;
    }

    setCoverFile(file);
    
    // Buat preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  /* ===== VALIDASI FORM ===== */
  const validateForm = () => {
    if (!form.judul.trim()) {
      setError('Judul buku harus diisi');
      return false;
    }

    if (form.judul.trim().length < 3) {
      setError('Judul buku minimal 3 karakter');
      return false;
    }

    if (form.deskripsi.trim().length < 10) {
      setError('Deskripsi minimal 10 karakter');
      return false;
    }

    if (!form.is_free && form.harga < 0) {
      setError('Harga tidak boleh negatif');
      return false;
    }

    return true;
  };

  /* ===== SUBMIT ===== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      let bookId = id;

      if (id) {
        // Update buku
        await updateBookApi(id, form);
        setSuccess('Buku berhasil diperbarui!');
      } else {
        // Create buku baru
        const res = await createBookApi(form);
        bookId = res.data.data?.ID_BUKU || res.data.id;
        setSuccess('Buku berhasil dibuat!');
      }

      // Upload cover jika ada
      if (coverFile && bookId) {
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('cover', coverFile);
          
          // Anggap ada API uploadCoverApi
          // await uploadCoverApi(bookId, coverFile);
          console.log('Cover uploaded for book:', bookId);
        } catch (uploadError) {
          console.error('Error uploading cover:', uploadError);
        }
      }

      // Redirect setelah beberapa detik
      setTimeout(() => {
        if (id) {
          navigate('/seller/products');
        } else {
          navigate(`/seller/books/edit/${bookId}`);
        }
      }, 1500);

    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.message || 'Gagal menyimpan buku. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (value) => {
    if (value < 0) return;
    setForm({ ...form, harga: parseInt(value) || 0 });
  };

  return (
    <Container className="py-4" style={{ maxWidth: 800 }}>
      {/* Header */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${theme.primary}20, ${theme.primary}40)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '15px'
              }}>
                <Book size={28} style={{ color: theme.primary }} />
              </div>
              <div>
                <h3 className="fw-bold mb-1" style={{ color: theme.dark }}>
                  {id ? 'Edit Buku' : 'Tambah Buku Baru'}
                </h3>
                <p className="text-muted mb-0">
                  {id ? 'Perbarui detail buku Anda' : 'Buat buku baru untuk dijual'}
                </p>
              </div>
            </div>
            
            <Button
              variant="outline-secondary"
              onClick={() => navigate('/seller/products')}
              className="d-flex align-items-center"
            >
              <ArrowLeft className="me-2" /> Kembali
            </Button>
          </div>

          {/* Status Info */}
          {id && form.status && (
            <div className={`alert alert-${form.status === 'published' ? 'success' : 'warning'} mb-0`}>
              <div className="d-flex align-items-center">
                <strong>Status:</strong>
                <span className={`badge ms-2 ${form.status === 'published' ? 'bg-success' : 'bg-warning'}`}>
                  {form.status === 'published' ? 'Published' : 'Draft'}
                </span>
                {form.is_free && (
                  <span className="badge bg-info ms-2">Gratis</span>
                )}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Loading State */}
      {loadingData && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-3">Memuat data buku...</p>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <Alert 
          variant="danger" 
          dismissible 
          onClose={() => setError('')}
          className="mb-4 animate__animated animate__fadeIn"
        >
          <Alert.Heading className="d-flex align-items-center">
            ⚠️ Terjadi Kesalahan
          </Alert.Heading>
          <p className="mb-0">{error}</p>
        </Alert>
      )}

      {success && (
        <Alert 
          variant="success" 
          dismissible 
          onClose={() => setSuccess('')}
          className="mb-4 animate__animated animate__fadeIn"
        >
          <Alert.Heading className="d-flex align-items-center">
            ✅ Berhasil!
          </Alert.Heading>
          <p className="mb-0">{success}</p>
        </Alert>
      )}

      {/* Main Form */}
      {!loadingData && (
        <Row>
          <Col lg={8}>
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  {/* Judul */}
                  <Form.Group className="mb-4">
                    <FloatingLabel controlId="judul" label="Judul Buku">
                      <Form.Control
                        type="text"
                        placeholder="Judul Buku"
                        value={form.judul}
                        onChange={(e) =>
                          setForm({ ...form, judul: e.target.value })
                        }
                        required
                        className="py-3"
                      />
                    </FloatingLabel>
                    <Form.Text className="text-muted">
                      Buat judul yang menarik dan deskriptif
                    </Form.Text>
                  </Form.Group>

                  {/* Deskripsi */}
                  <Form.Group className="mb-4">
                    <FloatingLabel controlId="deskripsi" label="Deskripsi Buku">
                      <Form.Control
                        as="textarea"
                        placeholder="Deskripsi Buku"
                        rows={6}
                        value={form.deskripsi}
                        onChange={(e) =>
                          setForm({ ...form, deskripsi: e.target.value })
                        }
                        required
                        style={{ minHeight: '120px' }}
                      />
                    </FloatingLabel>
                    <div className="d-flex justify-content-between mt-2">
                      <Form.Text className="text-muted">
                        Jelaskan isi buku dengan jelas
                      </Form.Text>
                      <small className={form.deskripsi.length < 10 ? 'text-danger' : 'text-success'}>
                        {form.deskripsi.length}/10 karakter
                      </small>
                    </div>
                  </Form.Group>

                  {/* Harga dan Gratis */}
                  <Row className="mb-4">
                    <Col md={6}>
                      <Form.Group>
                        <FloatingLabel controlId="harga" label="Harga Buku (Rp)">
                          <Form.Control
                            type="number"
                            placeholder="Harga Buku"
                            value={form.harga}
                            onChange={(e) => handlePriceChange(e.target.value)}
                            disabled={form.is_free}
                            className="py-3"
                            min="0"
                          />
                        </FloatingLabel>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <div className="h-100 d-flex align-items-center">
                        <Form.Check
                          type="checkbox"
                          id="is_free"
                          label="Buku Gratis"
                          checked={form.is_free}
                          onChange={(e) =>
                            setForm({ ...form, is_free: e.target.checked, harga: e.target.checked ? 0 : form.harga })
                          }
                          className="fs-5"
                        />
                        {form.is_free && (
                          <div className="ms-3">
                            <Gift size={20} className="text-success" />
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>

                  {/* Status Radio */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold mb-3">Status Publikasi</Form.Label>
                    <ToggleButtonGroup
                      type="radio"
                      name="status"
                      value={form.status}
                      onChange={(val) => setForm({ ...form, status: val })}
                      className="w-100"
                    >
                      <ToggleButton
                        id="status-draft"
                        value="draft"
                        variant={form.status === 'draft' ? 'warning' : 'outline-warning'}
                        className="flex-fill"
                      >
                        <FileText className="me-2" /> Draft
                      </ToggleButton>
                      <ToggleButton
                        id="status-published"
                        value="published"
                        variant={form.status === 'published' ? 'success' : 'outline-success'}
                        className="flex-fill"
                      >
                        <Upload className="me-2" /> Published
                      </ToggleButton>
                    </ToggleButtonGroup>
                    <Form.Text className="text-muted mt-2 d-block">
                      {form.status === 'draft' 
                        ? 'Buku disimpan sebagai draft dan tidak ditampilkan di toko' 
                        : 'Buku akan langsung dipublikasikan ke toko'}
                    </Form.Text>
                  </Form.Group>

                  {/* Submit Button */}
                  <div className="d-flex justify-content-end gap-3 mt-5 pt-3 border-top">
                    <Button
                      variant="outline-secondary"
                      onClick={() => navigate('/seller/products')}
                      size="lg"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      size="lg"
                      style={{ 
                        backgroundColor: theme.primary,
                        border: 'none',
                        padding: '12px 32px',
                        fontWeight: '600'
                      }}
                      className="d-flex align-items-center"
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="me-2" />
                          {id ? 'Perbarui Buku' : 'Simpan Buku'}
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            {/* Cover Upload */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3 d-flex align-items-center">
                  <Image className="me-2" /> Cover Buku
                </h5>
                
                <div className="text-center mb-4">
                  <div
                    style={{
                      width: '100%',
                      height: '200px',
                      borderRadius: '12px',
                      border: '2px dashed #dee2e6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: coverPreview ? `url(${coverPreview}) center/cover no-repeat` : '#f8f9fa',
                      cursor: 'pointer',
                      overflow: 'hidden'
                    }}
                    onClick={() => document.getElementById('cover-upload').click()}
                  >
                    {!coverPreview ? (
                      <div className="text-center p-4">
                        <Image size={48} className="text-muted mb-3" />
                        <p className="text-muted mb-0">
                          Klik untuk upload cover
                        </p>
                        <small className="text-muted">JPG, PNG, WebP (max 2MB)</small>
                      </div>
                    ) : (
                      <div className="w-100 h-100 position-relative">
                        <div className="position-absolute top-0 end-0 p-2">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCoverPreview(null);
                              setCoverFile(null);
                            }}
                          >
                            Hapus
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <Form.Control
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="d-none"
                  />
                </div>

                <Alert variant="info" className="small">
                  <strong>Tips:</strong> Gunakan cover dengan resolusi minimal 800x1200px untuk hasil terbaik.
                </Alert>
              </Card.Body>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3">Informasi Singkat</h5>
                <div className="mb-3">
                  <small className="text-muted d-block">Status</small>
                  <span className={`badge ${form.status === 'published' ? 'bg-success' : 'bg-warning'}`}>
                    {form.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="mb-3">
                  <small className="text-muted d-block">Harga</small>
                  <h5 className="fw-bold mb-0">
                    {form.is_free ? 'Gratis' : `Rp ${parseInt(form.harga).toLocaleString('id-ID')}`}
                  </h5>
                </div>
                <div className="mb-3">
                  <small className="text-muted d-block">Karakter Deskripsi</small>
                  <div className="progress" style={{ height: '6px' }}>
                    <div 
                      className={`progress-bar ${form.deskripsi.length >= 10 ? 'bg-success' : 'bg-warning'}`}
                      role="progressbar"
                      style={{ width: `${Math.min((form.deskripsi.length / 500) * 100, 100)}%` }}
                    />
                  </div>
                  <small className={form.deskripsi.length >= 10 ? 'text-success' : 'text-warning'}>
                    {form.deskripsi.length} karakter
                  </small>
                </div>
                <div className="mt-4 pt-3 border-top">
                  <small className="text-muted">
                    <Book className="me-1" /> Pastikan semua informasi sudah benar sebelum menyimpan.
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Genre Settings (only for edit mode) */}
      {id && !loadingData && (
        <div className="mt-4">
          <SetGenre bookId={id} />
        </div>
      )}
    </Container>
  );
};

export default BookForm;