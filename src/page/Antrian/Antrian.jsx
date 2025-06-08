import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import './Antrian.css';
import JakartaClock from '../../component/Jam/Jam';
import Swal from 'sweetalert2';

const socket = io(`${import.meta.env.VITE_SOCKET_PORT}`);

function Antrian() {
  const [sliderText, setSliderText] = useState('');
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  // locketDataTodayMapped akan menyimpan currentQueue dari database untuk tampilan persisten di kotak kecil
  const [locketDataTodayMapped, setLocketDataTodayMapped] = useState({});
  // activeCall akan menyimpan nomor antrean dan loket yang sedang aktif dipanggil di kotak utama.
  // Ini akan diatur oleh processUIQueue dan akan bertahan sampai panggilan berikutnya.
  const [activeCall, setActiveCall] = useState({ loketId: null, nomorAntrian: null });

  const [loadingLocketData, setLoadingLocketData] = useState(true);
  const [errorLocketData, setErrorLocketData] = useState(null); // Fixed the previous typo here

  const ttsQueue = useRef([]);
  const isSpeaking = useRef(false);

  const uiQueue = useRef([]); // Antrean untuk pembaruan UI di kotak utama
  const isUpdatingUI = useRef(false); // Flag untuk proses antrean UI (untuk tampilan)

  const DISPLAY_TIME_CONSECUTIVE = 6000; // Durasi tampilan nomor di kotak utama untuk setiap panggilan dalam antrean

  // Fungsi untuk memproses antrean TTS
  const processTTSQueue = () => {
    if (ttsQueue.current.length === 0) {
      isSpeaking.current = false;
      return;
    }
    if (isSpeaking.current) return;

    isSpeaking.current = true;
    const text = ttsQueue.current.shift();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';

    utterance.onend = () => {
      isSpeaking.current = false;
      processTTSQueue();
    };

    window.speechSynthesis.speak(utterance);
  };

  // Fungsi untuk memproses antrean UI (tampilan kotak utama)
  const processUIQueue = () => {
    if (uiQueue.current.length === 0) {
      isUpdatingUI.current = false;
      // Jangan reset activeCall di sini. Nomor terakhir yang ditampilkan akan bertahan.
      return;
    }
    if (isUpdatingUI.current) return; // Sedang memproses, tunggu giliran

    isUpdatingUI.current = true;
    const { loketId, nomorAntrian } = uiQueue.current.shift();

    // Set nomor yang sedang aktif dipanggil untuk kotak utama
    setActiveCall({ loketId, nomorAntrian });

    // Setelah DISPLAY_TIME_CONSECUTIVE, pindah ke item berikutnya di antrean UI
    setTimeout(() => {
      isUpdatingUI.current = false;
      processUIQueue(); // Lanjutkan ke antrean berikutnya
    }, DISPLAY_TIME_CONSECUTIVE);
  };

  useEffect(() => {
    socket.emit('joinTV');

    socket.on('antrianDipanggil', ({ loketId, nomorAntrian, locketData }) => {
      const loketNomor = loketId.replace('loket', ''); // 'loket1' -> '1'
      const text = `Nomor antrian ${nomorAntrian}, silakan menuju ke loket ${loketNomor}`;

      // Selalu tambahkan ke antrean TTS
      ttsQueue.current.push(text);
      processTTSQueue(); // Pastikan proses TTS berjalan

      const actualLoketId = parseInt(loketId.replace('loket', '')); // Convert 'loket1' to 1

      // Selalu tambahkan ke antrean UI untuk kotak utama
      uiQueue.current.push({ loketId: actualLoketId, nomorAntrian });
      if (!isUpdatingUI.current) {
        // Hanya mulai proses UI jika belum berjalan
        processUIQueue();
      }

      // Perbarui data locketDataTodayMapped secara persisten untuk kotak kecil
      setLocketDataTodayMapped((prev) => ({
        ...prev,
        [locketData.locket]: locketData.currentQueue,
      }));
    });

    const fetchSliderData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_GET_SLIDER}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSliderText(data.text);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Memuat Slider',
          text: 'Terjadi kesalahan saat mengambil data slider dari server.',
          confirmButtonText: 'Oke',
        });
      }
    };

    const fetchVideo = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_GET_VIDEO}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.path) {
          setVideoPreviewUrl(data.path);
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Memuat Video',
          text: 'Terjadi kesalahan saat mengambil data video dari server.',
          confirmButtonText: 'Oke',
        });
      }
    };

    fetchSliderData();
    fetchVideo();

    return () => {
      socket.off('antrianDipanggil');
    };
  }, []);

  // Effect untuk mengambil data locket saat pertama kali dimuat
  useEffect(() => {
    const fetchLocketData = async () => {
      try {
        setLoadingLocketData(true);
        setErrorLocketData(null);

        const response = await fetch(`${import.meta.env.VITE_CURENT_QUEUE}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(errorResult.error || 'Gagal mengambil data locket hari ini.');
        }

        const data = await response.json();

        const mappedData = {};
        let highestQueueNumber = 0;
        let loketOfHighestQueue = null;

        data.forEach((item) => {
          mappedData[item.locket] = item.currentQueue;
          // Cari nomor antrean terakhir yang dipanggil secara keseluruhan dari semua loket
          if (item.currentQueue > highestQueueNumber) {
            highestQueueNumber = item.currentQueue;
            loketOfHighestQueue = item.locket;
          }
        });
        setLocketDataTodayMapped(mappedData);

        // Inisialisasi activeCall dengan nomor antrean terakhir yang dipanggil secara keseluruhan
        // Ini memastikan kotak utama tidak kosong saat pertama kali TV dinyalakan jika sudah ada antrean.
        if (highestQueueNumber > 0 && loketOfHighestQueue !== null) {
          setActiveCall({ loketId: loketOfHighestQueue, nomorAntrian: highestQueueNumber });
        } else {
          setActiveCall({ loketId: null, nomorAntrian: '-' }); // Atau nilai default lain jika tidak ada antrean
        }
      } catch (error) {
        setErrorLocketData(error.message);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.message || 'Gagal memuat data layanan hari ini. Silakan coba lagi.',
          confirmButtonText: 'Oke',
        });
      } finally {
        setLoadingLocketData(false);
      }
    };

    fetchLocketData();
  }, []); // [] agar hanya dijalankan sekali saat komponen dimuat

  return (
    <div>
      <div className="container-fluid p-4 px-5">
        {/* Navbar */}
        <div className="col-12 pt-2 pb-3 d-flex flex-wrap justify-content-between align-items-center navbarAntrian">
          <div className="d-flex flex-wrap align-items-center">
            <img src="/assets/logo.png" alt="Kemenkumham Logo" className="logo" />
            <span className="logoText px-3">
              KANTOR WILAYAH KEMENTERIAN HUKUM <br />
              PROVINSI KEPULAUAN RIAU
            </span>
          </div>
          <div className="logoText">
            <JakartaClock />
          </div>
        </div>

        {/* Body */}
        <div className="col-12 d-flex flex-wrap my-2">
          {/* Kotak Antrian Utama (yang besar) */}
          <div className="col-6 p-3">
            <div className="col-12 bg-warning kotakLiveAntrian d-flex flex-column justify-content-center align-items-center">
              <span className="titleLiveAntrian">Antrian</span>
              <span className="nomerLiveAntrian">
                {activeCall.nomorAntrian || '-'} {/* Tampilkan nomor yang sedang aktif dipanggil */}
              </span>
              <span className="titleLiveAntrian">
                {activeCall.loketId ? `Loket ${activeCall.loketId}` : ''} {/* Tampilkan loket yang sedang aktif dipanggil */}
              </span>
            </div>
          </div>
          <div className="col-6 p-3">
            <div className="videoWrapper">
              <video src={videoPreviewUrl} className="videoElement" autoPlay muted loop playsInline></video>
            </div>
          </div>
        </div>

        <div className="col-12 d-flex flex-wrap">
          {[1, 2, 3, 4].map((loketNum) => (
            <div className="col-3 px-3" key={loketNum}>
              <div className="col-12 bg-warning kotakLiveLocket d-flex flex-column justify-content-center align-items-center">
                <span className="titleLiveLocket">Antrian</span>
                <span className="nomerLiveLocket">
                  {/* Selalu tampilkan locketDataTodayMapped karena ini adalah nomor persisten terakhir dipanggil */}
                  {locketDataTodayMapped[loketNum] || '0'}
                </span>
                <span className="titleLiveLocket">Loket {loketNum}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="col-12 py-2 bannerText">
        <span>{sliderText}</span>
      </div>
    </div>
  );
}

export default Antrian;
