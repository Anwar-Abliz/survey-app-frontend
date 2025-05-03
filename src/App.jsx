import React, { useEffect, useState } from 'react';
import SurveyForm from './Components/SurveyForm';
import SurveyChart from './Components/SurveyChart';
import surveyService from './services/surveyService'; // ✅ fixed: default import
import './App.css';

export default function App() {
  const [responses, setResponses] = useState([]);

  const loadResponses = async () => {
    try {
      const { data } = await surveyService.getResponses(); // ✅ fixed call
      setResponses(data);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  };

  useEffect(() => {
    loadResponses();
  }, []);

  return (
    <div className="container">
      <div className="header">
        <h1>Survey Questions</h1>
      </div>
      <SurveyForm onSubmitSuccess={loadResponses} />
      <div className="visualization-container">
        <div className="visualization-header">
          <h2>Opportunity Landscape</h2>
          <div className="responses-box">
            <p>Total Responses</p>
            <span>{responses.length}</span>
          </div>
        </div>
        <SurveyChart responses={responses} />
      </div>
    </div>
  );
}
