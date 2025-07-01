import './Login.css';
import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { useDispatch } from 'react-redux';
import { setLogin } from '../../state/index';
import { encryptData } from '../../component/Encrypt/Encrypt';

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [failed, setFailed] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loginAPI = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const fetchData = await fetch(`${import.meta.env.VITE_LOGIN_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: username,
          password: password,
        }),
      });

      if (fetchData.ok) {
        const data = await fetchData.json();
        const encryptedUser = encryptData(data.user);
        const encryptedToken = encryptData(data.token);
        dispatch(
          setLogin({
            user: encryptedUser,
            token: encryptedToken,
          })
        );
        Swal.fire({
          toast: true, // Kunci utama untuk mengubah jadi toast
          position: 'top-end', // Posisi ideal: pojok kanan atas
          icon: 'success',
          title: 'Login berhasil!',
          showConfirmButton: false,
          timer: 3000, // Beri waktu sedikit lebih lama agar mudah terbaca
          timerProgressBar: true,
          didOpen: (toast) => {
            // Fungsionalitas tambahan: timer berhenti jika mouse diarahkan ke notifikasi
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        }).then(() => {
          // Navigasi setelah Swal menutup (logika tetap sama)
          if (data.user.role === 'admin') {
            navigate('/dashboard');
          } else {
            navigate('/locket');
          }
        });
      } else {
        const data = await fetchData.json();
        setFailed(data.error);
        setIsLoading(false);
      }
    } catch (error) {
      setFailed('Gagal melakukan Login. Cek koneksi Anda.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (failed) {
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal!',
        text: failed,
        confirmButtonText: 'Coba Lagi',
      });
      setFailed(''); // Reset state failed agar tidak muncul lagi saat re-render
    }
  }, [failed]);
  return (
    <div className="container-fluid d-flex flex-wrap justify-content-center align-items-center vh-100">
      <div className="col-lg-5 col-xl-3 kotakLogin p-4 d-flex flex-column">
        <div className="d-flex flex-wrap align-items-center">
          <img src="/assets/logo.png" alt="Kemenkumham Logo" className="logoLogin " />
          <span className="logoTextLogin ps-3 col-10">
            KANTOR WILAYAH KEMENTERIAN HUKUM <br />
            KEPULAUAN RIAU
          </span>
          <form className="col-12" onSubmit={loginAPI}>
            <div className="d-flex flex-column mt-5 ">
              <label htmlFor="username" className="form-label username">
                Username
              </label>{' '}
              <input
                type="text"
                className="input"
                id="username"
                value={username}
                required
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username disini"
              />
            </div>
            <div className="d-flex flex-column mt-3 ">
              <label htmlFor="password" className="form-label username">
                Password
              </label>{' '}
              <input
                type="password"
                className="input"
                id="password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                placeholder="*******"
              />
            </div>
            <button type="submit" disabled={isLoading} className="col-12 mb-3 mt-5 rounded-3 buttonLogin border-0">
              {isLoading ? 'Memproses...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
