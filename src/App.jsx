import React, { useEffect, useState } from 'react';
import SurveyForm from './Components/SurveyForm';
import SurveyChart from './Components/SurveyChart';
import surveyService from './Services/surveyService';
import styles from './App.module.css';

export default function App() {
  const [responses, setResponses] = useState([]);
  const [chartData, setChartData] = useState([]);

  const loadResponses = async () => {
    try {
      const { data } = await surveyService.getResponses();
      console.log("Fetched responses:", data);
      setResponses(data);

      const allAnswers = data;
      const validAnswers = allAnswers.filter(
        a => a.outcome && a.importance && a.satisfaction
      );
      console.log("Valid Answers:", validAnswers);

      const grouped = {};
      validAnswers.forEach((answer) => {
        const key = answer.outcome;
        if (!grouped[key]) {
          grouped[key] = { question: key, imp: [], sat: [] };
        }
        grouped[key].imp.push(answer.importance);
        grouped[key].sat.push(answer.satisfaction);
      });

      const formattedChartData = Object.values(grouped).map((entry) => {
        const impScore = entry.imp.filter(v => v >= 4).length / entry.imp.length || 0;
        const satScore = entry.sat.filter(v => v >= 4).length / entry.sat.length || 0;
        const oppScore = impScore + Math.max(0, impScore - satScore);
        const outcome = entry.question
          ? entry.question
              .replace("Minimize the time to", "")
              .replace("Minimize the likelihood that you cannot", "")
              .trim()
          : "Unknown";
        return { outcome, impScore, satScore, oppScore };
      });

      console.log("Formatted chart data:", formattedChartData);
      setChartData(formattedChartData);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  };

  useEffect(() => {
    loadResponses();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
       <h2 className={styles.sectionTitle}>Survey Questions</h2>
       <button className="upload-btn" onClick={() => console.log("Upload clicked")}>
         Upload Survey
       </button>
    </div>


      <SurveyForm onSubmitSuccess={loadResponses} />


      <div className={styles.visualizationContainer}>
        <div className={styles.visualizationHeader}>
          <h2 className={styles.sectionTitle}>Opportunity Landscape</h2>
          <div className={styles.responsesBox}>
            <p>Total Responses</p>
            <span>{Math.floor(responses.length / 2)}</span>
          </div>
        </div>

        <SurveyChart chartData={chartData} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
          <button className="export-btn" onClick={() => console.log("Export clicked")}>
           Export Data
          </button>
        </div>

      </div>
    </div>
  );
}
