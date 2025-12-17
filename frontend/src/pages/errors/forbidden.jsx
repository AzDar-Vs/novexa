import React from 'react';
import { Link } from 'react-router-dom';

const Forbidden = () => {
  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="text-center">
        <h1 className="display-1 fw-bold text-danger">403</h1>
        <p className="fs-4">Akses Ditolak</p>
        <p className="text-muted">
          Kamu tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <Link to="/" className="btn btn-primary mt-3">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};

export default Forbidden;
