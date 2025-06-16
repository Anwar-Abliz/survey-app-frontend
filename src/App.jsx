import React, { useEffect, useState } from 'react';
import SurveyForm from './Components/SurveyForm';
import SurveyChart from './Components/SurveyChart';
import surveyService from './Services/surveyService';
import styles from './App.module.css';

export default function App() {
  const [responses, setResponses] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [questions, setQuestions] = useState([
    "Minimize the time to understand the essential terms and concepts in AI",
    "Minimize the time to apply the learned knowledge to enhance my learning"
  ]);
  const [circumstance, setCircumstance] = useState("learning new AI knowledge");
  const [solution, setSolution] = useState("LX monthly AI learning sessions");
  const [topic, setTopic] = useState("To evaluate the need and expectation of the session participants");

  const loadResponses = async () => {
    try {
      const { data } = await surveyService.getResponses();
      setResponses(data);

      const validAnswers = data.filter(
        a => a.outcome && a.importance && a.satisfaction
      );

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

      setChartData(formattedChartData);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data.outcomes)) {
          setQuestions(data.outcomes);
          setCircumstance(data.circumstance || "");
          setSolution(data.solution || "");
          setTopic(data.topic || "");
          alert("Survey loaded successfully!");
        } else {
          alert("Invalid format: 'outcomes' array is missing.");
        }
      } catch (err) {
        alert("Error reading file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleAddOutcome = () => {
    setQuestions(prev => [...prev, ""]);
  };

  useEffect(() => {
    loadResponses();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitleSmall}>Survey Questions</h2>
        <label className="upload-btn">
          Upload Survey
          <input type="file" accept=".json" onChange={handleFileUpload} className="file-upload" />
        </label>
      </div>

      {topic && (
        <p className={styles.topicLine}>{topic}</p>
      )}

      <SurveyForm
        questions={questions}
        circumstance={circumstance}
        solution={solution}
        onAddOutcome={handleAddOutcome}
        onSubmitSuccess={loadResponses}
      />

      <div className={styles.visualizationContainer}>
        <div className={styles.visualizationHeader}>
          <h2 className={styles.sectionTitleSmall}>Opportunity Landscape</h2>
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
