import React from 'react';
import { io } from 'socket.io-client'; // Import Socket.IO
import './Pengambilan.css';
import Swal from 'sweetalert2'; // Import SweetAlert2

// Inisialisasi koneksi Socket.IO
const socket = io(`${import.meta.env.VITE_SOCKET_PORT}`);

function Pengambilan() {
  // Fungsi untuk menangani klik pada kotak layanan
  const handleLayananClick = (locketId) => {
    Swal.fire({
      title: 'Konfirmasi Pengambilan Antrean',
      text: `Anda akan mengambil nomor antrean untuk Loket ${locketId}. Lanjutkan?`,
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

        // Tampilkan loading/proses ke pengguna
        Swal.fire({
          title: 'Memproses...',
          text: 'Sedang mengambil nomor antrean Anda. Mohon tunggu.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
      }
    });
  };

  // useEffect untuk mendengarkan balasan dari server
  React.useEffect(() => {
    // Event ketika nomor antrean berhasil diberikan
    socket.on('queueNumberAssigned', ({ locketId, nomorAntrian }) => {
      Swal.fire({
        icon: 'success',
        title: 'Nomor Antrean Anda:',
        html: `<h1>${nomorAntrian}</h1><p>Silakan tunggu panggilan di Loket ${locketId}</p>`,
        confirmButtonText: 'Oke',
        allowOutsideClick: false,
      });
      // Di sini Anda bisa menambahkan logika untuk mencetak nomor antrean jika ada printer thermal, dll.
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
    };
  }, []); // [] agar hanya dijalankan sekali saat komponen dimuat

  return (
    <div className="container-fluid gambarBackground col-12">
      <div className="col-3 d-flex justify-content-end align-items-center absoluteImage">
        <img src="/assets/logo.png" alt="Kemenkumham Logo" className="logo" />
        <span className="logoText px-3">
          LAYANAN ANTRIAN KEMENTERIAN <br /> HUKUM KEPULAUAN RIAU
        </span>
      </div>

      <div className="col-12 d-flex flex-column justify-content-center align-items-center ">
        <span className="titleSelection mb-4">Silahkan Memilih Jenis Layanan</span>
        <div className="col-lg-8 col-xl-6 d-flex flex-wrap justify-content-center align-items-center gap-4">
          {/* Kotak Layanan 1 - Diasumsikan untuk Loket 1 */}
          <div
            className="kotakLayanan d-flex align-items-center justify-content-center col-5"
            onClick={() => handleLayananClick(1)} // Panggil fungsi dengan ID loket
          >
            Layanan Imigrasi
          </div>
          {/* Kotak Layanan 2 - Diasumsikan untuk Loket 2 */}
          <div className="kotakLayanan d-flex align-items-center justify-content-center col-5" onClick={() => handleLayananClick(2)}>
            Layanan Pemasyarakatan
          </div>
          {/* Kotak Layanan 3 - Diasumsikan untuk Loket 3 */}
          <div className="kotakLayanan d-flex align-items-center justify-content-center col-5" onClick={() => handleLayananClick(3)}>
            Layanan AHU
          </div>
          {/* Kotak Layanan 4 - Diasumsikan untuk Loket 4 */}
          <div className="kotakLayanan d-flex align-items-center justify-content-center col-5" onClick={() => handleLayananClick(4)}>
            Layanan Bantuan Hukum
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pengambilan;
