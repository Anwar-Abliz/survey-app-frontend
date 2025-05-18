import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import styles from './SurveyChart.module.css';

const SurveyChart = ({ chartData }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartData?.length) return;

    const ctx = chartRef.current.getContext("2d");

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: chartData.map((point, index) => ({
          label: point.outcome,
          data: [{ x: point.impScore, y: point.satScore }],
          backgroundColor: "rgba(75, 192, 192, 0.7)",
          borderColor: "rgba(75, 192, 192, 1)",
          pointRadius: 6,
          pointHoverRadius: 8,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 30,
            right: 20,
            bottom: 20,
            left: 20,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const { x, y } = context.parsed;
                const outcome = chartData[context.dataIndex].outcome;
                const oppScore = chartData[context.dataIndex].oppScore;
                return [
                  `Outcome: ${outcome}`,
                  `Imp: ${x.toFixed(2)} | Sat: ${y.toFixed(2)}`,
                  `Opp: ${oppScore.toFixed(2)}`
                ];
              },
            },
          },
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Importance",
              font: { size: 16 }
            },
            min: 0,
            max: 1,
            ticks: {
              stepSize: 0.1,
              font: { size: 13 }
            },
          },
          y: {
            title: {
              display: true,
              text: "Satisfaction",
              font: { size: 16 }
            },
            min: 0,
            max: 1,
            ticks: {
              stepSize: 0.1,
              font: { size: 13 }
            },
          },
        },
      },
    });
  }, [chartData]);

  if (!chartData?.length) {
    return <div className={styles.chartContainer}>Loading chart data...</div>;
  }

  return (
    <div className={styles.chartContainer}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default SurveyChart;
