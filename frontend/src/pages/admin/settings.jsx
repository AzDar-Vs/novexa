const Setting = () => {
  return (
    <div className="container-fluid">
      <h4 className="mb-3">Settings</h4>

      <div className="card">
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">App Name</label>
            <input className="form-control" defaultValue="E-Book Store" />
          </div>

          <button className="btn btn-primary">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Setting;
