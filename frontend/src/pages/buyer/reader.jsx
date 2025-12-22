import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getChaptersApi, readChapterApi } from '../../api/reader.api';
import { Container, ListGroup, Card } from 'react-bootstrap';

const Reader = () => {
  const { bookId } = useParams();
  const [chapters, setChapters] = useState([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    getChaptersApi(bookId).then(res => setChapters(res.data.data));
  }, [bookId]);

  const openChapter = async (ch) => {
    if (ch.locked) return alert('Chapter locked');
    const res = await readChapterApi(ch.id);
    setContent(res.data.data);
  };

  return (
    <Container className="py-4">
      <h3>Reader</h3>

      <div className="d-flex gap-3">
        <ListGroup style={{ width: 300 }}>
          {chapters.map(ch => (
            <ListGroup.Item
              key={ch.id}
              action
              disabled={ch.locked}
              onClick={() => openChapter(ch)}
            >
              {ch.title} {ch.locked && '🔒'}
            </ListGroup.Item>
          ))}
        </ListGroup>

        <Card className="flex-fill p-3">
          {content || 'Select chapter'}
        </Card>
      </div>
    </Container>
  );
};

export default Reader;
