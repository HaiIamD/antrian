import React, { useState } from 'react';
import { io } from 'socket.io-client'; // Import Socket.IO
import './Pengambilan.css';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { FaBook, FaBalanceScale, FaWheelchair } from 'react-icons/fa';
import { HiLightBulb } from 'react-icons/hi';

// Inisialisasi koneksi Socket.IO
const socket = io(`${import.meta.env.VITE_SOCKET_PORT}`);

const layananData = [
  { id: 1, nama: 'Pelayanan Administrasi Hukum Umum', src: '/assets/LOGO_AHU.png' },
  { id: 2, nama: 'Kekayaan Intelektual', src: '/assets/ki.png' },
  { id: 3, nama: 'Layanan Hukum', src: '/assets/scales-of-justice.png' },
  { id: 4, nama: 'Disabilitas dan Pengaduan Masyarakat', src: '/assets/disabled_939181.png' },
];

function Pengambilan() {
  const [isLoading, setIsLoading] = useState(false);

  const showLoadingSwal = () => {
    setIsLoading(true);
    Swal.fire({
      title: 'Memproses...',
      text: 'Mohon tunggu sebentar, antrean sedang diproses.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  };

  const hideLoadingSwal = () => {
    if (Swal.isVisible()) {
      // Pastikan SweetAlert sedang terbuka sebelum mencoba menutup
      Swal.close();
    }
    setIsLoading(false); // Update state loading
  };

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
        showLoadingSwal();
        // Kirim event ke server Socket.IO
        socket.emit('requestQueueNumber', { locketId });
      }
    });
  };

  // useEffect untuk mendengarkan balasan dari server
  React.useEffect(() => {
    // Event ketika nomor antrean berhasil diberikan
    socket.on('queueNumberAssigned', ({ locketId, nomorAntrian }) => {
      hideLoadingSwal();
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
    <div className="gambarBackground col-12">
      <div className="col-12 d-flex flex-column justify-content-between align-content-between ">
        <div className="col-12 d-flex flex-column justify-content-center align-items-center sectionAtas p-3 ">
          <img src="/assets/logo.png" alt="Kemenkumham Logo" className="logo" />
          <span className="titleSelectionVertikal text-center">KEMENTERIAN HUKUM</span>
          <span className="subTitleSelectionVertikal mb-4 text-center">KANTOR WILAYAH KEPULAUAN RIAU</span>
          <div className="col-12 col-md-10 col-xl-6 d-flex flex-wrap justify-content-center align-items-center gap-2 gap-sm-4">
            {layananData.map((layanan) => (
              <div
                key={layanan.id}
                className="kotakLayanan d-flex flex-column align-items-center justify-content-center text-center col-5 col-sm-7 col-lg-5 p-3 p-md-4"
                onClick={() => handleLayananClick(layanan.id, layanan.nama)}
              >
                <div className="iconKotakLayanan">
                  <img src={layanan.src} alt={layanan.nama} style={{ width: '110px', height: '110px' }} />
                </div>
                <span className="pt-3 namaLayanan">{layanan.nama}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="sectionBawah d-flex flex-wrap justify-content-center gap-3 p-3">
          <img src="/assets/semakinPasti.png" alt="Semakin Pasti" className="imageFotter" />
          <img src="/assets/berakhlak.png" alt="Berakhlak" className="imageFotter" />
          <img src="/assets/banggaMelayaniBangsa.png" alt="Bangga Melayani Bangsa" className="imageFotter" />
          <img src="/assets/INDONESIAEMAS.png" alt="INDONESIA EMAS" className="imageFotter" />
          <img src="/assets/wbk.png" alt="WBK" className="imageFotter" />
        </div>
      </div>
    </div>
  );
}

export default Pengambilan;
