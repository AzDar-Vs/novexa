import { useEffect, useState } from 'react';
import { Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { getGenresApi } from '../../../api/genre.api';
import { setBookGenreApi } from '../../../api/buku.api';

const SetGenre = ({ bookId }) => {
  const [genres, setGenres] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await getGenresApi();
        setGenres(res.data.data);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter(g => g !== id)
        : [...prev, id]
    );
  };

  const save = async () => {
    await setBookGenreApi(bookId, selected);
    setMsg('Genre berhasil disimpan');
  };

  if (loading) return <Spinner />;

  return (
    <Card className="mt-3">
      <Card.Body>
        <h6>Genre Buku</h6>

        {msg && <Alert variant="success">{msg}</Alert>}

        <Form>
          {genres.map(g => (
            <Form.Check
              key={g.ID_GENRE}
              type="checkbox"
              label={g.NAMA_GENRE}
              checked={selected.includes(g.ID_GENRE)}
              onChange={() => toggle(g.ID_GENRE)}
            />
          ))}
        </Form>

        <Button className="mt-2" onClick={save}>
          Simpan Genre
        </Button>
      </Card.Body>
    </Card>
  );
};

export default SetGenre;
