import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import './SurveyChart.css';

export default function SurveyChart({ responses }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const outcomes = {};
    responses.flat().forEach(({ outcome, importance, satisfaction }) => {
      if (!outcomes[outcome]) outcomes[outcome] = { imp: [], sat: [] };
      outcomes[outcome].imp.push(importance);
      outcomes[outcome].sat.push(satisfaction);
    });

    const dataPoints = Object.entries(outcomes).map(([text, { imp, sat }]) => {
      const impScore = imp.filter(x => x >= 4).length / imp.length;
      const satScore = sat.filter(x => x >= 4).length / sat.length;
      const oppScore = impScore + Math.max(0, impScore - satScore);
      const cleanLabel = text.replace(/minimize (the time to |the likelihood that you cannot )/i, '');
      return {
        x: +(impScore * 10).toFixed(2),
        y: +(satScore * 10).toFixed(2),
        label: cleanLabel.trim(),
        oppScore: +oppScore.toFixed(2)
      };
    });

    if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    const ctx = chartRef.current.getContext("2d");

    chartInstanceRef.current = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Opportunity Points',
          data: dataPoints,
          backgroundColor: 'rgba(100, 149, 237, 0.7)',
          borderColor: '#4169e1',
          pointRadius: 8,
          pointHoverRadius: 10,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // ✅ important for resizing
        layout: {
          padding: {
            left: 20,
            right: 20,
            bottom: 30,
            top: 10
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: ctx => `Opp: ${ctx.raw.oppScore}, Outcome: ${ctx.raw.label}`
            }
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Importance' },
            min: 0,
            max: 10,
            ticks: { stepSize: 1 }
          },
          y: {
            title: { display: true, text: 'Satisfaction' },
            min: 0,
            max: 10,
            ticks: { stepSize: 1 }
          }
        }
      }
    });
  }, [responses]);

  return (
    <div className="chart-container">
      <canvas ref={chartRef} />
    </div>
  );
}
