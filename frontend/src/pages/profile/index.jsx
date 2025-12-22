import { useEffect, useState } from 'react';
import {
  Container, Card, Button, Form, Badge, Spinner
} from 'react-bootstrap';
import api from '../../api/axios';
import { useAuth } from '../../context/authContext';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const theme = {
    dark: '#1a472a',
    primary: '#2e7d32',
    cream: '#f5f5dc'
  };

  useEffect(() => {
    const loadProfile = async () => {
      const res = await api.get('/user/profile');
      setProfile(res.data.data);
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/user/profile', {
        name: profile.name,
        bio: profile.bio
      });
      setEdit(false);
      alert('Profil berhasil diperbarui');
    } catch {
      alert('Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: theme.cream, minHeight: '100vh' }}>
      <Container className="py-5" style={{ maxWidth: 700 }}>
        <Card className="shadow-sm border-0">
          <Card.Body>
            <h3 className="fw-bold mb-3">Profil {profile.role}</h3>

            <Badge bg={profile.role === 'seller' ? 'success' : 'primary'}>
              {profile.role.toUpperCase()}
            </Badge>

            <Form className="mt-4">
              <Form.Group className="mb-3">
                <Form.Label>Nama</Form.Label>
                <Form.Control
                  value={profile.name}
                  disabled={!edit}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control value={profile.email} disabled />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Bio</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  disabled={!edit}
                  value={profile.bio}
                  onChange={e => setProfile({ ...profile, bio: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Saldo</Form.Label>
                <Form.Control
                  value={`Rp ${Number(profile.saldo).toLocaleString('id-ID')}`}
                  disabled
                />
              </Form.Group>

              {!edit ? (
                <Button
                  style={{ backgroundColor: theme.primary, border: 'none' }}
                  onClick={() => setEdit(true)}
                >
                  Edit Profil
                </Button>
              ) : (
                <div className="d-flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setEdit(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    style={{ backgroundColor: theme.primary, border: 'none' }}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </div>
              )}
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Profile;
