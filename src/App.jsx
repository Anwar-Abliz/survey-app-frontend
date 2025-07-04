import React, { useEffect, useState } from 'react';
import SurveyForm from './Components/SurveyForm';
import SurveyChart from './Components/SurveyChart';
import ChatModal from './Components/ChatModal';
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
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [selectedModel, setSelectedModel] = useState("mistralai/mistral-7b-instruct");

  // Group responses by timestamp to count unique submissions
const uniqueSubmissions = new Set(responses.map(r => r.timestamp)).size;

  const modelOptions = [
    { label: "Mistral 7B (Fast)", value: "mistralai/mistral-7b-instruct" },
    { label: "GPT-3.5", value: "openai/gpt-3.5-turbo" },
    { label: "Claude 3 Sonnet", value: "anthropic/claude-3-sonnet" },
    { label: "Gemini-Pro", value: "google/gemini-pro" }
  ];

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

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const newHistory = [...chatHistory, { role: "user", content: userInput }];
    setChatHistory(newHistory);
    setUserInput("");

    try {
      const res = await fetch('http://localhost:5000/api/generate-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: userInput, model: selectedModel })
      });

      const data = await res.json();
      if (!data || !data.outcomes) {
        return alert("Invalid response from GPT.");
      }

      setAiResult(data);
    } catch (err) {
      console.error(err);
      alert("GPT generation failed.");
    }
  };

  useEffect(() => {
    loadResponses();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitleSmall}>Survey Questions</h2>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '1rem' }}>
          <button className="generate-btn" onClick={() => setShowModal(true)}>
            <strong>AI Survey Builder</strong>
          </button>
        </div>
      </div>

      {topic && <p className={styles.topicLine}>{topic}</p>}

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
            <span>{uniqueSubmissions}</span>
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
        <ChatModal
          setShowModal={setShowModal}
          setQuestions={setQuestions}
          setCircumstance={setCircumstance}
          setSolution={setSolution}
          setTopic={setTopic}
          onSubmitSuccess={loadResponses} 
        />
      )}
    </div>
  );
}
