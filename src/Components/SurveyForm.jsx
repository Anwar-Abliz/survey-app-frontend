import React, { useState } from 'react';
import surveyService from '../Services/surveyService';
import styles from './SurveyForm.module.css';

const scale = [1, 2, 3, 4, 5];

export default function SurveyForm({ questions, circumstance, solution, onSubmitSuccess }) {
  const [formData, setFormData] = useState({});

  const handleChange = (qIndex, type, value) => {
    setFormData(prev => ({
      ...prev,
      [qIndex]: {
        ...prev[qIndex],
        [type]: Number(value),
      }
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(formData).length !== questions.length) {
      alert("Please complete all questions before submitting.");
      return;
    }
    const formatted = questions.map((text, idx) => ({
      outcome: text,
      importance: formData[idx]?.importance,
      satisfaction: formData[idx]?.satisfaction
    }));
    try {
      await surveyService.submitResponse(formatted);
      onSubmitSuccess();
      setFormData({});
    } catch (err) {
      alert("Submission failed.");
    }
  };

  return (
    <div className="survey-container">
      <table>
        <thead>
          <tr>
            <th></th>
            <th colSpan={5} className="importance-header">
              When {circumstance}, how <span className="importance-text">important</span> is it to you to be able to:
            </th>
            <th colSpan={5} className="satisfaction-header">
              When using {solution}, how <span className="satisfaction-text">satisfied</span> are you with your ability to:
            </th>
          </tr>
          <tr>
            <th></th>
            {scale.map(n => (
              <th key={`imp-${n}`}>
                {['Not at all', 'Somewhat', '', 'Very', 'Extremely'][n - 1]}<br />important
              </th>
            ))}
            {scale.map(n => (
              <th key={`sat-${n}`}>
                {['Not at all', 'Somewhat', '', 'Very', 'Extremely'][n - 1]}<br />satisfied
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {questions.map((q, qIndex) => (
            <tr key={qIndex} className="question-row">
              <td>{q}</td>
              {scale.map(n => (
                <td key={`imp-${qIndex}-${n}`}>
                  <label className="radio-container importance-radio">
                    <input type="radio" name={`importance-${qIndex}`} value={n}
                      checked={formData[qIndex]?.importance === n}
                      onChange={() => handleChange(qIndex, 'importance', n)} />
                    <span className={`checkmark ${formData[qIndex]?.importance === n ? 'checkmark-selected' : ''}`}></span>
                  </label>
                </td>
              ))}
              {scale.map(n => (
                <td key={`sat-${qIndex}-${n}`}>
                  <label className="radio-container satisfaction-radio">
                    <input type="radio" name={`satisfaction-${qIndex}`} value={n}
                      checked={formData[qIndex]?.satisfaction === n}
                      onChange={() => handleChange(qIndex, 'satisfaction', n)} />
                    <span className={`checkmark ${formData[qIndex]?.satisfaction === n ? 'checkmark-selected' : ''}`}></span>
                  </label>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="buttons-container">
        <button className="submit-btn" onClick={handleSubmit}>Submit Response</button>
      </div>
    </div>
  );
}
