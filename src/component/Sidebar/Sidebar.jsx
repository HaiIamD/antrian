import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import { MdDashboard, MdManageAccounts } from 'react-icons/md';
import { PiFlagBannerFill } from 'react-icons/pi';
import { useLocation } from 'react-router-dom';
import { FaPeopleGroup } from 'react-icons/fa6';
import { setLogout } from '../../state/index';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { decryptData } from '../../component/Encrypt/Encrypt';
import { Link } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  const path = location.pathname;
  const dispatch = useDispatch();
  const encryptedUser = useSelector((state) => state.user);
  const encryptedToken = useSelector((state) => state.token);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const handleSimpanAntrian = async () => {
    if (!user || !user.locket || !token) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan Antrian',
        text: 'Informasi locket pengguna tidak ditemukan. Silakan coba login ulang.',
        confirmButtonText: 'Oke',
      });
      return;
    }

    Swal.fire({
      title: 'Konfirmasi Simpan Antrian',
      text: 'Apakah Anda yakin ingin menyimpan antrian harian? Tindakan ini akan mencatat total antrean hari ini.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Simpan',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${import.meta.env.VITE_SAVE_LOCKET}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `queue ${token}`,
            },
            body: JSON.stringify({
              locket: user.locket,
            }),
          });

          if (!response.ok) {
            const errorResult = await response.json();
            throw new Error(errorResult.error || `Gagal menyimpan antrian: ${response.statusText}`);
          }

          const data = await response.json();

          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: data.message || 'Antrian harian berhasil disimpan.',
            confirmButtonText: 'Oke',
          });
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Gagal!',
            text: error.message || 'Terjadi kesalahan saat menyimpan antrian. Silakan coba lagi.',
            confirmButtonText: 'Oke',
          });
        }
      }
    });
  };
  // --- AKHIR FUNGSI handleSimpanAntrian ---

  useEffect(() => {
    if (encryptedUser) {
      try {
        const decryptedUser = decryptData(encryptedUser);
        const decryptedToken = decryptData(encryptedToken);
        setUser(decryptedUser);
        setToken(decryptedToken);
      } catch (error) {
        console.error('Gagal decrypt data user:', error);
      }
    }
  }, []);

  return (
    <div className="col-6 col-md-4 col-xl-2 px-2 d-flex flex-column justify-content-between align-items-center vh-100 sideBar">
      <div className="col-12 mt-4 pt-1">
        <div className="d-flex flex-wrap align-items-center">
          <img src="/assets/logo.png" alt="Kemenkumham Logo" className="logoSidebar" />
          <span className="logoTextSidebar ps-2">
            KANTOR KEMENTERIAN HUKUM <br />
            PROVINSI KEPULAUAN RIAU
          </span>
        </div>
        <div className="col-12 d-flex flex-column mt-4">
          {user?.role === 'admin' && (
            <>
              <Link
                to="/dashboard"
                className={`col-12 ${path === '/dashboard' ? 'menuItemActive' : 'menuItem'} d-flex flex-wrap align-items-center gap-2 px-4 my-2`}
              >
                <MdDashboard className={path === '/dashboard' ? 'menuIconActive' : 'menuIcon'} />
                <span>Dashboard</span>
              </Link>

              <Link to="/banner" className={`col-12 ${path === '/banner' ? 'menuItemActive' : 'menuItem'} d-flex flex-wrap align-items-center gap-2 px-4 my-2`}>
                <PiFlagBannerFill className={path === '/banner' ? 'menuIconActive' : 'menuIcon'} />
                <span>Banner / Slider</span>
              </Link>

              <Link
                to="/management"
                className={`col-12 ${path === '/management' ? 'menuItemActive' : 'menuItem'} d-flex flex-wrap align-items-center gap-2 px-4 my-2`}
              >
                <MdManageAccounts className={path === '/management' ? 'menuIconActive' : 'menuIcon'} />
                <span>Manajemen User</span>
              </Link>
            </>
          )}
          {user?.role === 'staff' && (
            <>
              <Link className={`col-12 ${path === '/locket' ? 'menuItemActive' : 'menuItem'} d-flex flex-wrap align-items-center gap-2 px-4 my-2`}>
                <FaPeopleGroup className={path === '/locket' ? 'menuIconActive' : 'menuIcon'} />
                <span>Layanan Loket</span>
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="col-12 px-2 mb-3">
        <div className="d-flex flex-column kotakLogout p-3">
          {user?.role === 'staff' && <span className=" col-12 textWhite my-4">Jangan lupa simpan antrian harian sebelum pulang !</span>}
          {user?.role === 'admin' && <span className=" col-12 textWhite my-4">Semoga hari ini berjalan lancar dan menyenangkan ✨</span>}
          <div className="col-12 d-flex flex-column justify-content-center align-items-center">
            {user?.role === 'staff' && (
              <div className="col-10 buttonSimpanAntrian text-center my-2" onClick={handleSimpanAntrian}>
                Simpan Antrian
              </div>
            )}
            <div
              className="col-10 buttonLogout text-center"
              onClick={() => {
                Swal.fire({
                  title: 'Konfirmasi Logout',
                  text: 'Apakah Anda yakin ingin logout?',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#e74c3c',
                  cancelButtonColor: '#aaa',
                  confirmButtonText: 'Ya, Logout',
                  cancelButtonText: 'Batal',
                }).then((result) => {
                  if (result.isConfirmed) {
                    dispatch(setLogout());
                  }
                });
              }}
            >
              Logout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
