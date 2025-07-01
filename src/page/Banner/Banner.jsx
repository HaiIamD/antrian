import React, { useState, useRef, useEffect } from 'react'; // Import useRef
import './Banner.css';
import Sidebar from '../../component/Sidebar/Sidebar';
import Usernavbar from '../../component/Usernavbar/Usernavbar';
import { MdClose } from 'react-icons/md';
import { decryptData } from '../../component/Encrypt/Encrypt';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { FaBars } from 'react-icons/fa';

function Banner() {
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [sliderText, setSliderText] = useState('');
  const [initialSliderText, setInitialSliderText] = useState('');
  const [token, setToken] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const [videoFile, setVideoFile] = useState(null);
  const fileInputRef = useRef(null);
  const encryptedUser = useSelector((state) => state.token);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // --- Fungsi untuk menangani perubahan file (baik dari klik atau drag-and-drop) ---
  const handleFileChange = (file) => {
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      setVideoFile(null);
      setVideoPreviewUrl('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      Swal.fire({
        icon: 'error',
        title: 'Format Tidak Didukung',
        text: 'Mohon unggah file video yang valid (MP4, AVI, MOV).',
        confirmButtonText: 'Oke',
      });
    }
  };
  // --- Event handler untuk input file (saat diklik dan dipilih) ---
  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileChange(file);
  };
  // --- Event handler untuk Drag & Drop ---
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };
  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileChange(droppedFiles[0]);
    }
  };
  const clearVideoPreview = () => {
    setVideoFile(null);
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setVideoPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const saveSliderData = async () => {
    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: 'Tidak Diotorisasi',
        text: 'Anda harus login untuk menyimpan data.',
        confirmButtonText: 'Oke',
      });
      return;
    }

    if (sliderText === initialSliderText) {
      Swal.fire({
        icon: 'info',
        title: 'Tidak Ada Perubahan',
        text: 'Teks slider sama dengan yang tersimpan. Tidak ada yang disimpan.',
        confirmButtonText: 'Oke',
      });
      return; // Hentikan eksekusi jika tidak ada perubahan
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SAVE_SLIDER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `queue ${token}`,
        },
        body: JSON.stringify({ text: sliderText }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Token tidak valid atau kedaluwarsa.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const result = await response.json();
      setSliderText(result.text);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Data slider berhasil disimpan!',
        confirmButtonText: 'Oke',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: `Terjadi kesalahan saat menyimpan data: ${error.message}`,
        confirmButtonText: 'Oke',
      });
    }
  };

  const saveVideo = async () => {
    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: 'Tidak Diotorisasi',
        text: 'Anda harus login untuk menyimpan data.',
        confirmButtonText: 'Oke',
      });
      return;
    }
    if (!videoFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Pilih Video Dulu',
        text: 'Mohon pilih file video untuk diunggah.',
        confirmButtonText: 'Oke',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', videoFile);

    setIsUploading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SAVE_VIDEO}`, {
        method: 'POST',
        headers: {
          Authorization: `queue ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Token tidak valid atau kedaluwarsa.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const result = await response.json();
      setVideoPreviewUrl(result.filename);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Video berhasil disimpan!',
        confirmButtonText: 'Oke',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: `Terjadi kesalahan saat menyimpan data: ${error.message}`,
        confirmButtonText: 'Oke',
      });
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const fetchSliderData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_GET_SLIDER}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSliderText(data.text);
        setInitialSliderText(data.text);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Memuat Banner',
          text: 'Terjadi kesalahan saat mengambil data banner dari server.',
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

    if (encryptedUser) {
      try {
        const decryptedUser = decryptData(encryptedUser);
        setToken(decryptedUser);
      } catch (error) {
        console.error('Gagal decrypt data user:', error);
      }
    }
  }, []);

  const handleSaveConfirmation = () => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Anda akan menyimpan perubahan pada teks slider!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Simpan!',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        saveSliderData();
      }
    });
  };

  const handleSaveVideoConfirmation = () => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Anda akan menyimpan perubahan pada Video!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Simpan!',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        saveVideo();
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
        <div className="col-12 boxLayananHariIni mt-3 p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center px-3">
            <span className="primaryTextTitle "> Slider Antrean</span>
            <div className="px-4 py-1 tag" onClick={handleSaveConfirmation}>
              SAVE
            </div>
          </div>
          <div className="px-3 mt-4">
            <textarea className="col-12" placeholder="Masukkan teks di sini..." value={sliderText} onChange={(e) => setSliderText(e.target.value)}></textarea>
          </div>
        </div>
        <div className="col-12 boxLayananHariIni mt-3 p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center px-3">
            <span className="primaryTextTitle">Banner Video</span>
            <div className="px-4 py-1 tag" onClick={handleSaveVideoConfirmation}>
              SAVE
            </div>
          </div>
          <div className="px-3 mt-4">
            <input type="file" id="videoUpload" className="hidden-file-input" accept="video/*" onChange={handleInputChange} ref={fileInputRef} />
            <label
              htmlFor="videoUpload"
              className="modern-upload-area d-flex flex-column align-items-center justify-content-center"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isUploading ? (
                <div className="loading-overlay">
                  <div className="loading-spinner"></div>
                  <p className="upload-text mt-3">Mengunggah Video...</p>
                  <p className="upload-subtext">Mohon tunggu sebentar, ini mungkin memakan waktu beberapa saat.</p>
                </div>
              ) : videoPreviewUrl ? (
                <div className="video-preview-container">
                  <video src={videoPreviewUrl} controls className="video-preview" key={videoPreviewUrl}></video>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      clearVideoPreview();
                    }}
                    className="clear-video-button"
                  >
                    <MdClose size={24} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="upload-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8" />
                      <path d="M12 22V12" />
                      <path d="M17 17l-5 5-5-5" />
                    </svg>
                  </div>
                  <p className="upload-text">Klik atau seret video ke sini untuk mengunggah</p>
                  <p className="upload-subtext">Format yang didukung: MP4, AVI, MOV</p>
                </>
              )}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Banner;
