import React, { useState, useEffect } from 'react';
import Sidebar from '../../component/Sidebar/Sidebar';
import Usernavbar from '../../component/Usernavbar/Usernavbar';
import LineChart from '../../component/Chart/Linechart';
import DoughnutChart from '../../component/Chart/Piechart';
import './Dashboard.css';
import Swal from 'sweetalert2';

function Dashboard() {
  const [locketDataToday, setLocketDataToday] = useState([]);
  const [weekLocketData, setWeekLocketData] = useState(null);
  const [locketDataMapped, setLocketDataMapped] = useState({});
  const [filteredLocketData, setFilteredLocketData] = useState(null);
  const [filteredDataMapped, setFiltedDataMapped] = useState(null);
  const [selectedDays, setSelectedDays] = useState(30);

  const [loadingLocketData, setLoadingLocketData] = useState(true);
  const [errorLocketData, setErrorLocketData] = useState(null);
  const [loadingFilterData, setLoadingFilterData] = useState(false);
  const [errorFilterData, setErrorFilterData] = useState(null);

  const fetchFilteredLocketData = async (days) => {
    try {
      setLoadingFilterData(true);
      setErrorFilterData(null);

      // Panggil endpoint dengan query parameter 'days'
      const response = await fetch(`${import.meta.env.VITE_FILTER_QUEUE}?days=${days}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || `Gagal mengambil data locket ${days} Hari.`);
      }

      const data = await response.json();
      setFilteredLocketData(data);

      if (data && data.labels && data.datasets && data.datasets.length > 0) {
        const mappedData = {};
        const dataset = data.datasets[0];

        data.labels.forEach((label, index) => {
          mappedData[label] = {
            total: dataset.data[index],
          };
        });
        setFiltedDataMapped(mappedData);
      } else {
        setFiltedDataMapped({});
      }
    } catch (error) {
      setErrorFilterData(error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message || 'Gagal memuat data filter locket. Silakan coba lagi.',
        confirmButtonText: 'Oke',
      });
    } finally {
      setLoadingFilterData(false);
    }
  };

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
        setLocketDataToday(data);
      } catch (error) {
        console.error('Error fetching locket data:', error);
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

    const fetchWeekLocketData = async () => {
      try {
        setLoadingLocketData(true);
        setErrorLocketData(null);

        const response = await fetch(`${import.meta.env.VITE_WEEK_QUEUE}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(errorResult.error || 'Gagal mengambil data locket 7 Hari kemarin.');
        }

        const data = await response.json();

        setWeekLocketData(data);
        if (data && data.datasets) {
          const mappedData = {};
          data.datasets.forEach((dataset) => {
            const totalQueue = dataset.data.reduce((sum, current) => sum + current, 0);

            mappedData[dataset.label] = {
              total: totalQueue,
            };
          });
          setLocketDataMapped(mappedData);
        }
      } catch (error) {
        console.error('Error fetching locket data:', error);
        setErrorLocketData(error.message);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.message || 'Gagal memuat data layanan. Silakan coba lagi.',
          confirmButtonText: 'Oke',
        });
      } finally {
        setLoadingLocketData(false);
      }
    };

    fetchLocketData();
    fetchWeekLocketData();
  }, []);

  useEffect(() => {
    fetchFilteredLocketData(selectedDays);
  }, [selectedDays]);

  return (
    <div className="d-flex flex-wrap">
      <div className="col-0 col-xl-2 backgroundSmoke">
        <Sidebar />
      </div>
      <div className="col-12 col-xl-10 backgroundSmoke d-flex flex-column p-3">
        <Usernavbar />
        <div className="col-12 boxLayananHariIni my-3 p-4">
          <span className="primaryTextTitle ps-3"> Layanan Hari Ini</span>
          <div className="d-flex flex-wrap justify-content-center align-items-center ps-3 my-4">
            {loadingLocketData && <p>Memuat data layanan...</p>}
            {errorLocketData && <p style={{ color: 'red' }}>Error: {errorLocketData}</p>}
            {!loadingLocketData && !errorLocketData && locketDataToday.length > 0
              ? locketDataToday.map((locket, index) => (
                  <div key={locket._id} className="col-3 pe-3">
                    <div className={` ${index === 0 ? 'kotakDashboardBlue' : 'kotakDashboard'} d-flex flex-column align-items-center justify-content-center`}>
                      <span>Locket {locket.locket}</span>
                      <span className={index === 0 ? 'dataLocketBlue' : 'dataLocket'}>{locket.currentQueue}</span>
                    </div>
                  </div>
                ))
              : !loadingLocketData && !errorLocketData && locketDataToday.length === 0 && <p>Tidak ada data layanan hari ini.</p>}
          </div>
        </div>
        <div className="col-12 boxLayananAntrian p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center px-3">
            <span className="primaryTextTitle "> Aktivitas Layanan Antrian</span>
            <div className="px-4 py-1 tag" style={{ cursor: 'no-drop' }}>
              7 Hari
            </div>
          </div>
          <div className="d-flex flex-wrap align-items-center mt-4 mb-3">
            <div className="col-6 px-1 d-flex flex-wrap justify-content-between">
              {locketDataMapped && Object.keys(locketDataMapped).length > 0
                ? Object.keys(locketDataMapped).map((locketName) => (
                    <div className="col-6 p-2" key={locketName}>
                      <div className="kotakLockethistory d-flex flex-column justify-content-center align-items-center">
                        <span>{locketName}</span>
                        <span className="dataLocketHistory">{locketDataMapped[locketName].total}</span>
                      </div>
                    </div>
                  ))
                : !loadingLocketData && !errorLocketData && <p className="col-12 text-center">Tidak ada data locket untuk ditampilkan.</p>}
            </div>

            <div className="col-6 px-4 d-flex flex-wrap">{weekLocketData && <LineChart data={weekLocketData} />}</div>
          </div>
        </div>
        <div className="col-12 boxLayananAntrian my-3 p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center px-3">
            <span className="primaryTextTitle "> History Layanan Antrian</span>

            <select
              className=" px-4 py-1 tag no-arrow"
              value={selectedDays}
              onChange={(e) => setSelectedDays(parseInt(e.target.value))}
              disabled={loadingFilterData}
            >
              <option value={30}>30 Hari</option>
              <option value={180}>6 Bulan</option>
              <option value={365}>1 Tahun</option>
            </select>
          </div>
          <div className="d-flex flex-wrap align-items-center mt-4 mb-3">
            <div className="col-6 d-flex flex-wrap">{filteredLocketData && <DoughnutChart data={filteredLocketData} />}</div>
            <div className="col-6 px-1 d-flex flex-wrap justify-content-between">
              {filteredDataMapped && Object.keys(filteredDataMapped).length > 0
                ? Object.keys(filteredDataMapped).map((locketLabel) => (
                    <div className="col-6 p-2" key={locketLabel}>
                      <div className="kotakLockethistory d-flex flex-column justify-content-center align-items-center">
                        <span>{locketLabel}</span>
                        <span className="dataLocketHistory">{filteredDataMapped[locketLabel].total}</span>
                      </div>
                    </div>
                  ))
                : // Kondisi jika tidak ada data atau masih loading/error
                  !loadingFilterData && !errorFilterData && <p className="col-12 text-center">Tidak ada data locket untuk periode ini.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
