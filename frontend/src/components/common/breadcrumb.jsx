import { Alert } from 'react-bootstrap';

const AlertMsg = ({ variant = 'info', message, onClose }) => {
  if (!message) return null;

  return (
    <Alert variant={variant} dismissible={!!onClose} onClose={onClose}>
      {message}
    </Alert>
  );
};

export default AlertMsg;
