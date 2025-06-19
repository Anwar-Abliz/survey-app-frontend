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
  const [showModal, setShowModal] = useState(false);
  const [inputTopic, setInputTopic] = useState("");

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

  useEffect(() => {
    loadResponses();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitleSmall}>Survey Questions</h2>
        <button className="generate-btn" onClick={() => setShowModal(true)}>
          Generate Survey
        </button>
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

      {showModal && (
        <div className={"modal"}>
          <div className={"modalContent"}>
            <h3>Generate Survey</h3>
            <p>Click "Generate" to create a new survey with default questions.</p>
            <label>Enter your survey topic:</label>
            <input
              type="text"
              placeholder="Enter topic"
              value={inputTopic}
              onChange={(e) => setInputTopic(e.target.value)}
              className="modal-input"
            />
            <button
              className="submit-btn"
              style={{ marginRight: '0.5rem' }}
              onClick={async () => {
                if (!inputTopic.trim()) return alert("Please enter a topic.");

                try {
                  const res = await fetch('http://localhost:5000/api/generate-survey', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic: inputTopic })
                  });

                  const data = await res.json();
                  if (!data || !data.outcomes) {
                    return alert("Invalid response from GPT.");
                  }

                  // Generate downloadable JSON
                  const json = JSON.stringify(data, null, 2);
                  const blob = new Blob([json], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'upload-survey.json';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);

                  setShowModal(false);
                  setInputTopic('');
                } catch (err) {
                  alert("GPT generation failed.");
                  console.error(err);
                }
              }}
            >
              Generate
            </button>

            <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
