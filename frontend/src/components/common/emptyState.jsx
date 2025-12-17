import { Button } from 'react-bootstrap';

const EmptyState = ({
  title = 'Data tidak ditemukan',
  description = 'Belum ada data yang tersedia.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="text-center py-5">
      <h5 className="mb-2">{title}</h5>
      <p className="text-muted">{description}</p>

      {actionLabel && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
