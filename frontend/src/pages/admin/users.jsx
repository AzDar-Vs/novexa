import UserTable from '../../components/admin/UserTable';

const User = () => {
  return (
    <div className="container-fluid">
      <h4 className="mb-3">Users Management</h4>

      <div className="card">
        <div className="card-body">
          <UserTable />
        </div>
      </div>
    </div>
  );
};

export default User;
