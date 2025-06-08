// JakartaClock.js
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/id'; // Import locale Indonesia

dayjs.extend(utc);
dayjs.extend(timezone);

function JakartaClock() {
  const [currentTime, setCurrentTime] = useState(dayjs().tz('Asia/Jakarta'));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs().tz('Asia/Jakarta'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const tanggal = currentTime.locale('id').format('dddd, DD MMMM YYYY'); // Hari, tanggal
  const jam = currentTime.format('HH.mm'); // Jam pakai titik

  return (
    <div className=" text-center">
      {tanggal}
      <br />
      {jam} WIB
    </div>
  );
}

export default JakartaClock;
