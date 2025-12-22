import { useState } from 'react';
import { Button, Form, Alert } from 'react-bootstrap';
import { uploadCoverApi } from '../../../api/buku.api';

const UploadCover = ({ bookId }) => {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');

  const upload = async () => {
    if (!file) return;

    try {
      await uploadCoverApi(bookId, file);
      setMsg('Cover berhasil diupload');
    } catch {
      setMsg('Gagal upload cover');
    }
  };

  return (
    <>
      {msg && <Alert>{msg}</Alert>}
      <Form.Control
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <Button className="mt-2" onClick={upload}>
        Upload Cover
      </Button>
    </>
  );
};

export default UploadCover;
