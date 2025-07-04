import React, { useState } from 'react';
import styles from './ChatModal.module.css';

export default function ChatModal({
  setShowModal,
  setQuestions,
  setCircumstance,
  setSolution,
  setTopic,
  onSubmitSuccess

}) {
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [selectedModel, setSelectedModel] = useState('mistralai/mistral-7b-instruct');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const newHistory = [...chatHistory, { role: 'user', content: userInput }];
    setChatHistory(newHistory);
    setUserInput('');

    try {
      const res = await fetch('http://localhost:5000/api/generate-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: userInput, model: selectedModel })
      });

      const data = await res.json();
      if (!data || !data.outcomes) return alert('Invalid response from GPT');

      setAiResult(data);
    } catch (err) {
      console.error('GPT error:', err);
      alert('GPT generation failed');
    }
  };

// Step 1: Trigger confirmation modal
const handleDeploy = () => {
  if (!aiResult) return;
  setShowConfirmReset(true);
};

// Step 2: Run reset + deploy logic if confirmed
const confirmDeploy = async () => {
  try {
    // 1. Save generated survey
    await fetch("http://localhost:5000/api/generated-surveys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(aiResult)
    });

    // 2. Reset previous responses
    await fetch("http://localhost:5000/api/responses/reset", {
      method: "POST"
    });

    // 3. Update UI state
    setQuestions(aiResult.outcomes || []);
    setCircumstance(aiResult.circumstance || "");
    setSolution(aiResult.solution || "");
    setTopic(aiResult.topic || "");
    setShowConfirmReset(false);
    setShowModal(false);

    // ✅ 4. Refresh chart/response count *after* UI update
    if (onSubmitSuccess) onSubmitSuccess();
  } catch (err) {
    console.error("Failed to reset responses:", err);
  }
};



  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h3>Generate Survey with AI</h3>

        {aiResult && (
          <>
            <div className={styles.previewBox}>
              <div className={styles.previewLine}>
                This survey is to assess the situation of participants
              </div>
              <div className={styles.previewSub}>{aiResult.topic}</div>
            </div>

            <div className={styles.editBlock}>
                <strong>Topic:</strong>
                <textarea
                    className={styles.textarea}
                    value={aiResult.topic}
                    onChange={(e) => setAiResult({ ...aiResult, topic: e.target.value })}
                    rows={2}
                />
                <strong>Circumstance:</strong>
                <textarea
                    className={styles.textarea}
                    value={aiResult.circumstance}
                    onChange={(e) => setAiResult({ ...aiResult, circumstance: e.target.value })}
                    rows={3}
                />
                <strong>Solution:</strong>
                <textarea
                    className={styles.textarea}
                    value={aiResult.solution}
                    onChange={(e) => setAiResult({ ...aiResult, solution: e.target.value })}
                    rows={3}
                />
                <strong>Outcomes:</strong>
                {aiResult.outcomes.map((o, i) => (
                    <textarea
                    key={i}
                    className={styles.textarea}
                    value={o}
                    onChange={(e) => {
                        const newOut = [...aiResult.outcomes];
                        newOut[i] = e.target.value;
                        setAiResult({ ...aiResult, outcomes: newOut });
                    }}
                    rows={2}
                    />
                ))}
            </div>
          </>
        )}

        <input
          type="text"
          placeholder="Ask something or enter a topic..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className={styles.modalInput}
        />
        <button className="submit-btn" onClick={handleSend} style={{ marginTop: '0.5rem' }}>
          Send
        </button>

        <label style={{ marginTop: '1rem' }}>Choose model:</label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className={styles.modelDropdown}
        >
          <option value="mistralai/mistral-7b-instruct">Mistral 7B (Fast)</option>
          <option value="openai/gpt-3.5-turbo">GPT-3.5</option>
          <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet</option>
          <option value="google/gemini-pro">Gemini-Pro</option>
        </select>

        {aiResult && (
          <div style={{ marginTop: '1rem' }}>
            <p><strong>Ready to deploy?</strong></p>
            <button className="submit-btn" onClick={handleDeploy} style={{ marginRight: '0.5rem' }}>
              Deploy to Form
            </button>
            <button className="cancel-btn" onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </div>
        )}

        {!aiResult && (
          <button className="cancel-btn" style={{ marginTop: '1rem' }} onClick={() => setShowModal(false)}>
            Close
          </button>
        )}
        {showConfirmReset && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3>Confirm Reset</h3>
              <p>This will delete all previous responses and reset the counter. Proceed?</p>
              <div className={styles.confirmActions}>
                <button className={`${styles.cancelBtn}`} onClick={() => setShowConfirmReset(false)}>
                  Cancel
                </button>
                <button className={`${styles.submitBtn}`} onClick={confirmDeploy}>
                  Confirm & Deploy
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
