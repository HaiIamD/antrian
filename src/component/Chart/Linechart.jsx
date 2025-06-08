import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Legend, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Legend, Tooltip);

const LineChart = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        intersect: false,
        mode: 'index',
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true },
    },
  };
  return (
    <div className="col-12 d-flex justify-content-center">
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;
