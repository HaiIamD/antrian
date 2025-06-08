import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateScale: true,
      animateRotate: true,
    },
    transitions: {
      active: {
        animation: {
          duration: 500, // lama transisi hover (ms)
          easing: 'easeOutQuart',
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed} kunjungan`,
        },
      },
    },
    hover: {
      mode: 'nearest',
      intersect: true,
    },
  };

  return (
    <div style={{ width: '430px', height: '430px', margin: 'auto' }}>
      <Pie data={data} options={options} />
    </div>
  );
};

export default PieChart;
