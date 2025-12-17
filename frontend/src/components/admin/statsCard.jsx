export default function statsCard({ title, value, icon, variant = 'primary' }) {
  return (
    <div className={`card border-${variant} h-100`}>
      <div className="card-body d-flex align-items-center justify-content-between">
        <div>
          <h6 className="text-muted">{title}</h6>
          <h3 className="fw-bold">{value}</h3>
        </div>
        <div className={`text-${variant} fs-1`}>
          <i className={`bi ${icon}`}></i>
        </div>
      </div>
    </div>
  );
}
