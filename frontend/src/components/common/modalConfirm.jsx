import { Modal, Button } from 'react-bootstrap';

const ModalConfirm = ({
  show,
  title = 'Konfirmasi',
  message = 'Apakah kamu yakin?',
  onCancel,
  onConfirm,
  confirmText = 'Ya',
  cancelText = 'Batal',
}) => {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>{message}</Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalConfirm;
