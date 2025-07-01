import React, { useState, useEffect } from 'react';
import './Management.css';
import Sidebar from '../../component/Sidebar/Sidebar';
import Usernavbar from '../../component/Usernavbar/Usernavbar';
import { FaPlus, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import Swal from 'sweetalert2';
import { decryptData } from '../../component/Encrypt/Encrypt';
import { useSelector } from 'react-redux';
import { FaBars } from 'react-icons/fa';

function Management() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const encryptedUser = useSelector((state) => state.token);
  const [token, setToken] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const [newUserData, setNewUserData] = useState({
    userName: '',
    password: '',
    locket: '',
    role: '',
  });

  const [usersData, setUsersData] = useState([]);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setCurrentUser(null);
    setNewUserData({
      userName: '',
      password: '',
      locket: '',
      role: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setIsEditMode(true);
    setCurrentUser(user);
    setNewUserData({
      userName: user.userName,
      password: '',
      locket: user.locket,
      role: user.role,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();

    if (!newUserData.userName || !newUserData.password || !newUserData.locket || !newUserData.role) {
      Swal.fire({
        icon: 'error',
        title: 'Input Tidak Lengkap',
        text: 'Mohon untuk di isi seluruh form terlebih dahulu.',
        confirmButtonText: 'Oke',
      });
      return;
    }
    Swal.fire({
      title: 'Mohon Tunggu...',
      text: 'Sedang mendaftarkan pengguna baru.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await fetch(`${import.meta.env.VITE_REGISTER_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `queue ${token}`,
        },
        body: JSON.stringify({
          userName: newUserData.userName,
          password: newUserData.password,
          role: newUserData.role,
          locket: newUserData.locket,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Terjadi kesalahan saat registrasi.');
      }

      setUsersData((prevUsers) => [...prevUsers, result.user]);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: result.message || 'Pengguna baru berhasil ditambahkan.',
        confirmButtonText: 'Oke',
      });

      setNewUserData({
        userName: '',
        password: '',
        locket: '',
        role: '',
      });

      closeModal();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: error.message || 'Terjadi kesalahan saat registrasi. Silahkan coba lagi.',
        confirmButtonText: 'Oke',
      });
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    if (!currentUser || !newUserData.userName || !newUserData.locket || !newUserData.role) {
      Swal.fire({
        icon: 'error',
        title: 'Input Tidak Lengkap',
        text: 'Username, Loket, dan Role wajib diisi untuk pembaruan.',
        confirmButtonText: 'Oke',
      });
      return;
    }

    const hasChanges =
      newUserData.userName !== currentUser.userName ||
      newUserData.locket !== currentUser.locket ||
      newUserData.role !== currentUser.role ||
      (newUserData.password && newUserData.password.length > 0); // Periksa jika password baru diisi

    if (!hasChanges) {
      Swal.fire({
        icon: 'info',
        title: 'Tidak Ada Perubahan',
        text: 'Tidak ada data yang diperbarui karena tidak ada perubahan.',
        confirmButtonText: 'Oke',
      });
      closeModal();
      return;
    }

    Swal.fire({
      title: 'Mohon Tunggu...',
      text: 'Sedang memperbarui data pengguna.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const dataToSend = {
        userName: newUserData.userName,
        locket: newUserData.locket,
        role: newUserData.role,
      };

      if (newUserData.password) {
        dataToSend.password = newUserData.password;
      }
      const response = await fetch(`${import.meta.env.VITE_UPDATE_USER}/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `queue ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Terjadi kesalahan saat memperbarui pengguna.');
      }

      setUsersData((prevUsers) => prevUsers.map((user) => (user._id === currentUser._id ? result.user : user)));

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: result.message || 'Data pengguna berhasil diperbarui.',
        confirmButtonText: 'Oke',
      });

      closeModal();
    } catch (error) {
      console.error('Error saat memperbarui user:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: error.message || 'Terjadi kesalahan saat memperbarui. Silahkan coba lagi.',
        confirmButtonText: 'Oke',
      });
    }
  };

  const handleDeleteUser = (userId) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Anda tidak akan bisa mengembalikan ini!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Mohon Tunggu...',
          text: 'Sedang menghapus pengguna.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        try {
          const response = await fetch(`${import.meta.env.VITE_DELETE_USER}/${userId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `queue ${token}`,
            },
          });

          if (!response.ok) {
            const errorResult = await response.json();
            throw new Error(errorResult.error || 'Terjadi kesalahan saat menghapus pengguna.');
          }

          if (response.ok) {
            setUsersData((prevUsers) => prevUsers.filter((user) => user._id !== userId));
            Swal.fire('Terhapus!', 'Pengguna telah berhasil dihapus.', 'success');
          } else {
            const errorResult = await response.json();
            throw new Error(errorResult.error || 'Terjadi kesalahan saat menghapus pengguna.');
          }
        } catch (error) {
          Swal.close();
          Swal.fire('Gagal!', error.message || 'Terjadi kesalahan saat menghapus. Silahkan coba lagi.', 'error');
        }
      }
    });
  };
  useEffect(() => {
    if (encryptedUser) {
      try {
        const decryptedData = decryptData(encryptedUser);
        const fetchedToken = decryptedData;

        if (fetchedToken) {
          setToken(fetchedToken);

          const fetchAllUser = async () => {
            try {
              const response = await fetch(`${import.meta.env.VITE_GET_ALL_USER}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `queue ${fetchedToken}`,
                },
              });
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              const data = await response.json();
              setUsersData(data);
            } catch (error) {
              console.error('Gagal mengambil data user:', error);
              Swal.fire({
                icon: 'error',
                title: 'Gagal Mengambil Data User',
                text: 'Terjadi kesalahan saat mengambil data user dari server.',
                confirmButtonText: 'Oke',
              });
            }
          };

          fetchAllUser();
        }
      } catch (error) {
        console.error('Gagal mendekripsi data user:', error);
      }
    }
  }, [encryptedUser, setToken]);

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
            <span className="primaryTextTitle">Manajemen Pengguna</span>
            {/* Tombol "Tambah Pengguna" yang akan membuka modal dalam mode tambah */}
            <div className="px-4 py-2 tag d-flex align-items-center" style={{ cursor: 'pointer' }} onClick={openAddModal}>
              <FaPlus className="me-2" />
              Tambah Pengguna
            </div>
          </div>
          <div className="px-3 mt-4">
            {/* Tabel berisi daftar user */}
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Locket</th>
                    <th>Role</th>
                    <th>Tanggal Dibuat</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Mapping data pengguna dari state usersData ke baris tabel */}
                  {usersData.map((user) => (
                    <tr key={user._id}>
                      <td>{user.userName}</td>
                      <td>{user.locket}</td>
                      <td>{user.role}</td>
                      <td>
                        {new Date(user.createdAt).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                          timeZone: 'Asia/Jakarta',
                        })}
                      </td>
                      <td>
                        {/* Tombol Edit: Membuka modal dalam mode edit dengan data pengguna ini */}
                        <button className="btn btn-outline-primary btn-sm me-2" onClick={() => openEditModal(user)}>
                          <FaEdit />
                        </button>
                        {/* Tombol Delete: Memanggil fungsi handleDeleteUser dengan ID pengguna */}
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteUser(user._id)}>
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tambah/Edit Pengguna */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h5>
              <button className="modal-close-button" onClick={closeModal}>
                <MdClose size={24} />
              </button>
            </div>
            <form onSubmit={isEditMode ? handleUpdateUser : handleSaveUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="userName">Username</label>
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    className="form-control"
                    value={newUserData.userName}
                    onChange={handleInputChange}
                    placeholder="Masukkan Username"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-control"
                    value={newUserData.password}
                    onChange={handleInputChange}
                    placeholder={isEditMode ? 'Biarkan kosong jika tidak ingin mengubah password' : 'Masukkan password'}
                  />
                </div>
                <div className="d-flex justify-content-between gap-3">
                  <div className="form-group flex-grow-1">
                    <label htmlFor="locket">Loket</label>
                    <select id="locket" name="locket" className="form-control" value={newUserData.locket} onChange={handleInputChange}>
                      <option value="">Pilih Loket</option>
                      {/* Membuat opsi angka 1-4 secara dinamis */}
                      {[...Array(4)].map((_, i) => (
                        <option key={i + 1} value={`${i + 1}`}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group flex-grow-1">
                    <label htmlFor="role">Role</label>
                    <select id="role" name="role" className="form-control" value={newUserData.role} onChange={handleInputChange}>
                      <option value="">Pilih Role</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="buttonSave col-12 py-2">
                  {isEditMode ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Management;
