import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Locket from './page/Locket/Locket';
import Antrian from './page/Antrian/Antrian';
import PengambilanLocket from './page/Pengambilan/Pengambilan';
import Login from './page/Login/Login';
import Dashboard from './page/Dashboard/Dashboard';
import Banner from './page/Banner/Banner';
import Management from './page/Management/Management';

function App() {
  const isAuth = Boolean(useSelector((state) => state.token));
  return (
    <>
      <div className="app">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PengambilanLocket />} />
            <Route path="/antrean" element={<Antrian />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={isAuth ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/banner" element={isAuth ? <Banner /> : <Navigate to="/login" />} />
            <Route path="/management" element={isAuth ? <Management /> : <Navigate to="/login" />} />
            <Route path="/locket" element={isAuth ? <Locket /> : <Navigate to="/login" />} />
            <Route path="*" element={<Antrian />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
