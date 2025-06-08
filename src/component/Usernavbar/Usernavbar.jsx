import React, { useEffect, useState } from 'react';
import './Usernavbar.css';
import { decryptData } from '../../component/Encrypt/Encrypt';
import { useSelector } from 'react-redux';
import JakartaClock from '../../component/Jam/Jam';

function Usernavbar() {
  const encryptedUser = useSelector((state) => state.user);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (encryptedUser) {
      try {
        const decryptedUser = decryptData(encryptedUser);
        setUser(decryptedUser);
      } catch (error) {
        console.error('Gagal decrypt data user:', error);
      }
    }
  }, []);
  return (
    <div className="userNavbar d-flex flex-wrap justify-content-between align-items-center py-2 px-4">
      <span className="primaryTextTitle ps-3">{user?.userName}</span>
      <div className="primaryText">
        <JakartaClock />
      </div>
      <div className="p-2 px-4 tagUser me-3">{user?.role === 'admin' ? 'Administrator' : user?.role === 'staff' ? `Locket ${user?.locket || ''}` : ''}</div>
    </div>
  );
}

export default Usernavbar;
