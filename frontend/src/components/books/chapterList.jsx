import { ListGroup } from 'react-bootstrap';

const ChapterList = ({ chapters, onSelect }) => {
  return (
    <ListGroup>
      {chapters.map((c) => (
        <ListGroup.Item
          key={c.id}
          action
          onClick={() => onSelect(c.id)}
        >
          Bab {c.nomer_bab} - {c.judul_bab}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default ChapterList;
