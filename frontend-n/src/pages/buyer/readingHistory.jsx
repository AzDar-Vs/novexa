import { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Pagination, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getBuyerReadingHistoryApi } from '../../api/buyer.api';
import { ClockHistory, Book, Calendar, Clock, ArrowRight } from 'react-bootstrap-icons';

const ReadingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  useEffect(() => {
    loadHistory();
  }, [pagination.page]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: pagination.limit };
      const res = await getBuyerReadingHistoryApi(params);
      setHistory(res.data.data.history || []);
      setPagination(prev => ({
        ...prev,
        total: res.data.data.pagination?.total || 0,
        totalPages: res.data.data.pagination?.totalPages || 1
      }));
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const theme = {
    primary: '#2D5A27',
    light: '#F5F5DC'
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return 'success';
    if (progress >= 50) return 'warning';
    return 'info';
  };

  return (
    <Container fluid className="px-3 px-md-4" style={{ backgroundColor: theme.light, minHeight: '100vh' }}>
      {/* Header */}
      <div className="py-4">
        <h2 className="fw-bold" style={{ color: theme.primary }}>
          <ClockHistory className="me-2" /> Riwayat Membaca
        </h2>
        <p className="text-muted">Catatan aktivitas membaca Anda</p>
      </div>

      {/* History Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
              <p className="mt-3">Memuat riwayat...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-5">
              <ClockHistory size={48} className="text-muted mb-3" />
              <h5>Belum ada riwayat membaca</h5>
              <p className="text-muted">Mulailah membaca buku dari library Anda</p>
              <Button as={Link} to="/buyer/library" variant="success" className="mt-2">
                <Book className="me-1" /> Ke Library
              </Button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Buku</th>
                      <th>Progress</th>
                      <th>Terakhir Dibaca</th>
                      <th>Bab Terakhir</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-3" style={{ width: '50px', height: '70px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                              {item.cover ? (
                                <img 
                                  src={item.cover} 
                                  alt={item.bookTitle}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                                />
                              ) : (
                                <div className="d-flex align-items-center justify-content-center h-100">
                                  <Book size={20} className="text-muted" />
                                </div>
                              )}
                            </div>
                            <div>
                              <strong className="d-block">{item.bookTitle}</strong>
                              <small className="text-muted">oleh {item.author}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge bg={getProgressColor(item.PROGRESS)}>
                            {item.PROGRESS}%
                          </Badge>
                          <div className="progress mt-1" style={{ width: '100px', height: '5px' }}>
                            <div 
                              className={`progress-bar bg-${getProgressColor(item.PROGRESS)}`}
                              style={{ width: `${item.PROGRESS}%` }}
                            ></div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <small className="d-block">
                              <Calendar size={12} className="me-1" />
                              {item.lastRead.split(',')[0]}
                            </small>
                            <small className="text-muted">
                              <Clock size={12} className="me-1" />
                              {item.timeAgo}
                            </small>
                          </div>
                        </td>
                        <td>
                          {item.lastChapterTitle ? (
                            <small>Bab {item.chapterNumber}: {item.lastChapterTitle}</small>
                          ) : (
                            <small className="text-muted">Belum mulai</small>
                          )}
                        </td>
                        <td>
                          <Button 
                            as={Link}
                            to={`/read/${item.bookId}`}
                            size="sm"
                            variant="outline-success"
                          >
                            <ArrowRight className="me-1" /> Lanjut
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.Prev 
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    />
                    
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <Pagination.Item
                        key={i + 1}
                        active={i + 1 === pagination.page}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </Pagination.Item>
                    ))}
                    
                    <Pagination.Next 
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    />
                  </Pagination>
                </div>
              )}

              {/* Stats */}
              <div className="mt-4 pt-3 border-top">
                <div className="row text-center">
                  <div className="col">
                    <h5 className="fw-bold">{history.length}</h5>
                    <small>Aktivitas</small>
                  </div>
                  <div className="col">
                    <h5 className="fw-bold text-success">
                      {history.filter(h => h.PROGRESS === 100).length}
                    </h5>
                    <small>Selesai Dibaca</small>
                  </div>
                  <div className="col">
                    <h5 className="fw-bold text-warning">
                      {new Set(history.map(h => h.bookId)).size}
                    </h5>
                    <small>Buku Berbeda</small>
                  </div>
                </div>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ReadingHistory;