import { Form, Row, Col, Button } from 'react-bootstrap';

const BookFilter = ({ genres, filters, onChange, onSubmit }) => {
  return (
    <Form onSubmit={onSubmit} className="mb-4">
      <Row>
        <Col md={4}>
          <Form.Control
            placeholder="Search title..."
            name="search"
            value={filters.search}
            onChange={onChange}
          />
        </Col>

        <Col md={3}>
          <Form.Select
            name="genre"
            value={filters.genre}
            onChange={onChange}
          >
            <option value="">All Genres</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nama}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={3}>
          <Form.Select
            name="sort"
            value={filters.sort}
            onChange={onChange}
          >
            <option value="">Sort</option>
            <option value="newest">Newest</option>
            <option value="popular">Popular</option>
            <option value="price_low">Price: Low</option>
            <option value="price_high">Price: High</option>
          </Form.Select>
        </Col>

        <Col md={2}>
          <Button type="submit" className="w-100">
            Filter
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default BookFilter;
