import React from 'react';
import { io } from 'socket.io-client'; // Import Socket.IO
import './Pengambilan.css';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { FaBook, FaBalanceScale, FaWheelchair } from 'react-icons/fa';
import { HiLightBulb } from 'react-icons/hi';

// Inisialisasi koneksi Socket.IO
const socket = io(`${import.meta.env.VITE_SOCKET_PORT}`);

const layananData = [
  { id: 1, nama: 'Pelayanan Hukum Umum', icon: <FaBook /> },
  { id: 2, nama: 'Kekayaan Intelektual', icon: <HiLightBulb /> },
  { id: 3, nama: 'Layanan Hukum', icon: <FaBalanceScale /> },
  { id: 4, nama: 'Disabilitas dan Pengaduan Masyarakat', icon: <FaWheelchair /> },
];

function Pengambilan() {
  // Fungsi untuk menangani klik pada kotak layanan
  const handleLayananClick = (locketId, locketName) => {
    Swal.fire({
      title: 'Konfirmasi Pengambilan Antrean',
      text: `Anda akan mengambil nomor antrean untuk Loket ${locketName}. Lanjutkan?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Ambil Antrean!',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        // Kirim event ke server Socket.IO
        socket.emit('requestQueueNumber', { locketId });
      }
    });
  };

  // useEffect untuk mendengarkan balasan dari server
  React.useEffect(() => {
    // Event ketika nomor antrean berhasil diberikan
    socket.on('queueNumberAssigned', ({ locketId, nomorAntrian }) => {
      Swal.close();
      Swal.fire({
        html: `
          <p style="font-weight: bold;">Nomor antrean Anda adalah:</p>
          <h1 style="font-size: 4.5rem; margin: 10px 0;">${nomorAntrian}</h1>
          <p style="font-weight: bold;">Silakan tunggu hingga nomor Anda dipanggil.</p>
          <hr>
          <p style="font-size: 0.9em;">Jika struk antrean tidak keluar, silakan klik tombol "Cetak Ulang".</p>
        `,
        confirmButtonText: 'Oke',
        allowOutsideClick: false,
        showDenyButton: true,
        denyButtonText: 'Cetak Ulang',
      }).then((result) => {
        if (result.isDenied) {
          socket.emit('reprintTicket', { locketId, nomorAntrian });

          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: 'Perintah cetak ulang dikirim!',
            showConfirmButton: false,
            timer: 2000,
          });
        }
      });
    });

    socket.on('reprintSuccess', ({ message }) => {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: message || 'Berhasil dicetak ulang!',
        showConfirmButton: false,
        timer: 3000,
      });
    });

    socket.on('reprintError', ({ message }) => {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mencetak Ulang',
        text: message || 'Tidak dapat mencetak ulang struk.',
      });
    });

    // Event ketika terjadi error saat mengambil nomor antrean
    socket.on('queueAssignmentError', ({ message }) => {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengambil Antrean',
        text: message || 'Terjadi kesalahan saat mengambil nomor antrean. Silakan coba lagi.',
        confirmButtonText: 'Oke',
      });
    });

    // Cleanup function untuk menghapus listener saat komponen di-unmount
    return () => {
      socket.off('queueNumberAssigned');
      socket.off('queueAssignmentError');
      socket.off('reprintSuccess');
      socket.off('reprintError');
    };
  }, []);

  return (
    <div className="container-fluid gambarBackground col-12">
      <div className="col-5 d-flex justify-content-end align-items-center absoluteImage d-none d-md-flex">
        <img src="/assets/logo.png" alt="Kemenkumham Logo" className="logo" />
        <span className="logoText px-3">
          KANTOR WILAYAH <br /> KEMENTERIAN HUKUM <br />
          KEPULAUAN RIAU
        </span>
      </div>

      <div className="col-12 d-flex flex-column justify-content-center align-items-center ">
        <span className="titleSelection mb-4 text-center">Silahkan Memilih Jenis Layanan</span>

        {/* --- PERUBAHAN 1: Buat container lebih fleksibel --- */}
        <div className="col-12 col-md-10 col-xl-6 d-flex flex-wrap justify-content-center align-items-center gap-2 gap-sm-4">
          {layananData.map((layanan) => (
            <div
              key={layanan.id}
              className="kotakLayanan d-flex flex-column align-items-center justify-content-center text-center col-5 col-sm-6 col-lg-5 p-3 p-md-4"
              onClick={() => handleLayananClick(layanan.id, layanan.nama)}
            >
              <div className="iconKotakLayanan">{layanan.icon}</div>
              <span className="pt-3 namaLayanan">{layanan.nama}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Pengambilan;
