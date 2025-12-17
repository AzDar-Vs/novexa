const LoginForm = ({ onSubmit, loading }) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="mb-3">
        <label>Email</label>
        <input name="email" type="email" className="form-control" required />
      </div>

      <div className="mb-3">
        <label>Password</label>
        <input name="password" type="password" className="form-control" required />
      </div>

      <button className="btn btn-primary w-100" disabled={loading}>
        {loading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;
