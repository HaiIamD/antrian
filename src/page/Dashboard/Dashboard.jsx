import React, { useState, useEffect } from 'react';
import Sidebar from '../../component/Sidebar/Sidebar';
import Usernavbar from '../../component/Usernavbar/Usernavbar';
import LineChart from '../../component/Chart/Linechart';
import DoughnutChart from '../../component/Chart/Piechart';
import './Dashboard.css';
import Swal from 'sweetalert2';
import { FaBars } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { subDays } from 'date-fns';

function Dashboard() {
  const today = new Date();

  const [locketDataToday, setLocketDataToday] = useState([]);
  const [weekLocketData, setWeekLocketData] = useState(null);
  const [locketDataMapped, setLocketDataMapped] = useState({});
  const [filteredLocketData, setFilteredLocketData] = useState(null);
  const [filteredDataMapped, setFiltedDataMapped] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const [loadingLocketData, setLoadingLocketData] = useState(true);
  const [errorLocketData, setErrorLocketData] = useState(null);
  const [errorLocketDataWeek, setErrorLocketDataWeek] = useState(null);
  const [loadingFilterData, setLoadingFilterData] = useState(false);
  const [errorFilterData, setErrorFilterData] = useState(null);
  const [dateRange, setDateRange] = useState([subDays(today, 7), subDays(today, 1)]);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    if (startDate && endDate) {
      fetchFilteredLocketData(startDate, endDate);
    }
  }, [dateRange]);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const fetchFilteredLocketData = async (startDate, endDate) => {
    try {
      setLoadingFilterData(true);
      setErrorFilterData(null);

      // Panggil endpoint dengan query parameter 'days'
      const response = await fetch(`${import.meta.env.VITE_FILTER_QUEUE}?startDate=${startDate}&endDate=${endDate} `, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        setLoadingFilterData(false);
        setFiltedDataMapped({});
        setFilteredLocketData(null);
        const errorResult = await response.json();
        throw new Error(errorResult.error || `Gagal mengambil data locket.`);
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
      // setErrorFilterData(error.message);
      setLoadingFilterData(false);

      // Swal.fire({
      //   icon: 'error',
      //   title: 'Error!',
      //   text: error.message || 'Gagal memuat data filter locket. Silakan coba lagi.',
      //   confirmButtonText: 'Oke',
      // });
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
        setErrorLocketDataWeek(error.message);
      } finally {
        setLoadingLocketData(false);
      }
    };

    fetchLocketData();
    fetchWeekLocketData();
  }, []);

  return (
    <div className={`d-flex flex-wrap ${isSidebarOpen ? 'sidebar-overlay' : ''}`}>
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
        <div className="col-12 boxLayananHariIni my-3 p-4">
          <span className="primaryTextTitle ps-3"> Layanan Hari Ini</span>
          <div className="d-flex flex-wrap justify-content-center align-items-center ps-3 my-4">
            {loadingLocketData && <p>Memuat data layanan...</p>}
            {errorLocketData && <p style={{ color: 'red' }}>{errorLocketData}</p>}
            {!loadingLocketData && !errorLocketData && locketDataToday.length > 0
              ? locketDataToday.map((locket, index) => (
                  <div key={locket._id} className="col-12 col-sm-6 col-lg-3 p-2">
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
            <span className="primaryTextTitle "> Aktivitas Layanan Antrean</span>
            <div className="px-4 py-1 tag" style={{ cursor: 'no-drop' }}>
              7 Hari
            </div>
          </div>
          <div className="d-flex flex-wrap align-items-center mt-4 mb-3">
            {errorLocketDataWeek && (
              <p class=" col-12" style={{ textAlign: 'center' }}>
                {errorLocketDataWeek}
              </p>
            )}
            <div className="col-12 col-md-6 px-1 d-flex flex-wrap justify-content-between">
              {locketDataMapped && Object.keys(locketDataMapped).length > 0
                ? Object.keys(locketDataMapped).map((locketName) => (
                    <div className="col-6 p-2" key={locketName}>
                      <div className="kotakLockethistory d-flex flex-column justify-content-center align-items-center">
                        <span>{locketName}</span>
                        <span className="dataLocketHistory">{locketDataMapped[locketName].total}</span>
                      </div>
                    </div>
                  ))
                : !loadingLocketData && !errorLocketDataWeek && <p className="col-12 text-center">Tidak ada data locket untuk ditampilkan.</p>}
            </div>

            <div className="col-12 col-md-6  d-flex flex-wrap">{weekLocketData && <LineChart data={weekLocketData} />}</div>
          </div>
        </div>
        <div className="col-12 boxLayananAntrian my-3 p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center px-3">
            <span className="primaryTextTitle "> History Layanan Antrean</span>

            <div>
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                  setDateRange(update);
                }}
                isClearable={true}
                maxDate={today}
                placeholderText="Pilih rentang tanggal"
                className="px-5 py-1 tag text-center"
                dateFormat="dd/MM/yyyy"
              />
            </div>
          </div>
          <div className="d-flex flex-wrap align-items-center mt-4 mb-3">
            {/* [BARU] Kondisi utama untuk memeriksa apakah ada data untuk ditampilkan */}
            {filteredLocketData && filteredLocketData.labels && filteredLocketData.labels.length > 0 ? (
              // Jika ADA data, tampilkan kedua kolom (chart dan tabel)
              <React.Fragment>
                <div className="col-12 col-md-6 d-flex flex-wrap">
                  <DoughnutChart data={filteredLocketData} />
                </div>

                <div className="col-12 col-md-6 px-1 d-flex flex-wrap justify-content-between">
                  {Object.keys(filteredDataMapped).map((locketLabel) => (
                    <div className="col-6 p-2" key={locketLabel}>
                      <div className="kotakLockethistory d-flex flex-column justify-content-center align-items-center">
                        <span>{locketLabel}</span>
                        <span className="dataLocketHistory">{filteredDataMapped[locketLabel].total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </React.Fragment>
            ) : (
              // [BARU] Jika TIDAK ADA data, tampilkan pesan ini di tengah
              // Kondisi ini hanya berjalan jika tidak sedang loading dan tidak ada error
              !loadingFilterData &&
              !errorFilterData && (
                <div className="col-12 text-center">
                  <p>Tidak ada data loket untuk periode ini.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
