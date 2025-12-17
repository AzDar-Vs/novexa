import { Pagination } from 'react-bootstrap';

const PaginationComponent = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  return (
    <Pagination className="justify-content-center mt-4">
      <Pagination.Prev
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      />

      {[...Array(totalPages)].map((_, i) => (
        <Pagination.Item
          key={i}
          active={page === i + 1}
          onClick={() => onChange(i + 1)}
        >
          {i + 1}
        </Pagination.Item>
      ))}

      <Pagination.Next
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      />
    </Pagination>
  );
};

export default PaginationComponent;
