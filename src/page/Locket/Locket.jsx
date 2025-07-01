import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from '../../component/Sidebar/Sidebar';
import Usernavbar from '../../component/Usernavbar/Usernavbar';
import './Locket.css';
import Swal from 'sweetalert2';
import { decryptData } from '../../component/Encrypt/Encrypt';
import { useSelector } from 'react-redux';
import { FaBars } from 'react-icons/fa';

const socket = io(`${import.meta.env.VITE_SOCKET_PORT}`);

function Locket() {
  const [loket, setLoket] = useState(''); // Akan diisi dari data user
  const encryptedUser = useSelector((state) => state.token);
  const encryptedData = useSelector((state) => state.user);
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null); // Ubah menjadi null atau objek kosong
  const [dataLocket, setDataLocket] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    if (encryptedUser && encryptedData) {
      try {
        const decryptedToken = decryptData(encryptedUser);
        const decryptedUser = decryptData(encryptedData);

        setToken(decryptedToken);
        setUser(decryptedUser);
        setLoket(decryptedUser.locket); // Set loket dari data user

        // Gabung ke room socket loket setelah mendapatkan loket ID
        socket.emit('joinLoket', decryptedUser.locket);
        Swal.fire({
          icon: 'info',
          title: 'Bergabung',
          text: `Anda bergabung ke Loket ${decryptedUser.locket}`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      } catch (error) {
        console.error('Gagal mendekripsi data user atau token:', error);
      }
    }
  }, [encryptedUser, encryptedData]);

  // Effect untuk fetch data locket pertama kali dan mendengarkan update
  useEffect(() => {
    if (user?.locket && token) {
      // Pastikan user dan token sudah ada
      const fetchLocketData = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_GET_LOCKET}/${user.locket}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `queue ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setDataLocket(data);
        } catch (error) {
          console.error('Gagal mengambil data locket:', error);
          Swal.fire({
            icon: 'error',
            title: 'Gagal Mengambil Data Loket',
            text: 'Terjadi kesalahan saat mengambil data loket dari server.',
            confirmButtonText: 'Oke',
          });
        }
      };

      fetchLocketData();

      // Mendengarkan event locketDataUpdated dari server
      socket.on('locketDataUpdated', (data) => {
        if (data.locket === user.locket) {
          // Pastikan update untuk loket ini
          setDataLocket(data);
          Swal.fire({
            icon: 'success',
            title: 'Antrean Dipanggil!',
            text: `Nomor antrean ${data.currentQueue} telah dipanggil.`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
        }
      });

      // Mendengarkan jika tidak ada antrean lagi
      socket.on('noMoreQueue', ({ loketId, message }) => {
        if (`loket${user.locket}` === loketId) {
          Swal.fire({
            icon: 'info',
            title: 'Informasi',
            text: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
          });
        }
      });

      socket.on('totalQueueUpdatedForLocket', (data) => {
        if (data.locket === user.locket) {
          setDataLocket((prev) => {
            return {
              ...prev,
              totalQueue: data.totalQueue,
            };
          });
          Swal.fire({
            icon: 'info',
            title: 'Antrean Baru!', // Ubah judul
            text: `Nomor antrean baru telah diambil. Total: ${data.totalQueue}.`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
        }
      });
      // Mendengarkan jika ada error saat memanggil antrean
      socket.on('callQueueError', ({ loketId, message }) => {
        if (`loket${user.locket}` === loketId) {
          Swal.fire({
            icon: 'error',
            title: 'Error Panggilan',
            text: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
          });
        }
      });

      return () => {
        socket.off('locketDataUpdated');
        socket.off('noMoreQueue');
        socket.off('totalQueueUpdatedForLocket');
        socket.off('callQueueError');
      };
    }
  }, [user, token]); // Re-run effect jika user atau token berubah

  const handlePanggilBerikutnya = () => {
    if (!loket) {
      Swal.fire({
        icon: 'warning',
        title: 'Loket Belum Teridentifikasi',
        text: 'Pastikan loket Anda sudah teridentifikasi.',
        confirmButtonText: 'Oke',
      });
      return;
    }

    Swal.fire({
      title: 'Panggil Antrean Selanjutnya?',
      text: `Anda akan memanggil antrean Nomor ${dataLocket?.nextQueue || '...'} untuk Loket ${loket}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Panggil!',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        socket.emit('callNextQueue', { loketId: loket }); // Mengirim ID loket (angka)
        Swal.fire({
          icon: 'info',
          title: 'Memanggil...',
          text: `Antrean Nomor ${dataLocket?.nextQueue || '...'} sedang dipanggil.`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          icon: 'info',
          title: 'Dibatalkan',
          text: 'Panggilan antrean dibatalkan.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };

  return (
    <div className="d-flex flex-wrap vh-100">
      <div className="col-0 col-xl-2 backgroundSmoke">
        <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />
      </div>
      <div className="col-12 col-xl-10 backgroundSmoke d-flex flex-column p-3">
        <div className="hamburger-container d-xl-none">
          <button className="hamburger-button" onClick={toggleSidebar}>
            <FaBars />
          </button>
        </div>
        <Usernavbar />
        <div className="col-12 boxLayananHariIni mt-3 p-5 d-flex flex-column justify-content-center align-items-center">
          <div className="col-12 col-xl-8 kotakAntrianSekarang d-flex flex-column justify-content-center align-items-center p-4">
            <span className="titleLiveAntrianLocket text-center">
              Antrean <br />
              Sekarang
            </span>
            <span className="nomerLiveAntrianLocket">{dataLocket?.currentQueue ?? 0}</span>
          </div>
          <div className="col-12 col-xl-8 mt-4 d-flex flex-wrap justify-content-between align-items-center">
            <div className="col-12 col-md-4 p-2 ">
              <div className="kotakLocket d-flex flex-column justify-content-center align-items-center ">
                <span className="titleKotakLocket text-center">Antrean Sebelumnya</span>
                <span className="nomerKotakLocket">{dataLocket?.lastTakenNumber ?? 0}</span>
              </div>
            </div>
            <div className="col-12 col-md-4 p-2 ">
              <div className="kotakLocket d-flex flex-column justify-content-center align-items-center ">
                <span className="titleKotakLocket text-center">Total Antrean</span>
                <span className="nomerKotakLocket">{dataLocket?.totalQueue ?? 0}</span>
              </div>
            </div>
            <div className="col-12 col-md-4 p-2 ">
              <div className="kotakLocket d-flex flex-column justify-content-center align-items-center ">
                <span className="titleKotakLocket text-center">Antrean Selanjutnya</span>
                <span className="nomerKotakLocket">{dataLocket?.nextQueue ?? 0}</span>
              </div>
            </div>
          </div>
          <div
            className="col-12 col-xl-8 buttonPanggil d-flex flex-column justify-content-center align-items-center p-2 py-3 mt-4"
            onClick={handlePanggilBerikutnya}
          >
            Panggil Antrian selanjutnya
          </div>
        </div>
      </div>
    </div>
  );
}

export default Locket;
