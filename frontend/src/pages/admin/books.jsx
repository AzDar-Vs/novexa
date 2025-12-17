import BookTable from '../../components/admin/bookTable';

const Books = () => {
  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Books Management</h4>
      </div>

      <div className="card">
        <div className="card-body">
          <BookTable />
        </div>
      </div>
    </div>
  );
};

export default Book;
