const DashboardLayout = ({ sidebar, children }) => (
  <div className="d-flex">
    {sidebar}
    <main className="p-4 w-100">{children}</main>
  </div>
);

export default DashboardLayout;
