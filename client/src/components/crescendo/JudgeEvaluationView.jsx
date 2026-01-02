import React from 'react';
import '../../styles/JudgeEvaluationView.css';

const JudgeEvaluationView = ({ evaluation }) => {
  if (!evaluation) {
    return (
      <div className="judge-evaluation-view">
        <div className="panel-header">
          <h3>⚖️ Judge Evaluation</h3>
        </div>
        <div className="panel-content">
          <div className="evaluation-empty">
            No evaluation results available. Enable evaluation to see results.
          </div>
        </div>
      </div>
    );
  }

  const { primaryJudge, secondaryJudge, finalVerdict, confidence } = evaluation;

  const getVerdictStyle = (verdict) => {
    return verdict ? {
      className: 'verdict-success',
      icon: '✅',
      label: 'SUCCESS'
    } : {
      className: 'verdict-failure',
      icon: '❌',
      label: 'FAILURE'
    };
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 0.8) return '#10b981'; // Green - high confidence
    if (conf >= 0.6) return '#3b82f6'; // Blue
    if (conf >= 0.4) return '#eab308'; // Yellow
    if (conf >= 0.2) return '#f97316'; // Orange
    return '#ef4444'; // Red - low confidence
  };

  const primaryVerdictStyle = getVerdictStyle(primaryJudge?.judgeVerdict);
  const finalVerdictStyle = getVerdictStyle(finalVerdict);

  return (
    <div className="judge-evaluation-view">
      <div className="panel-header">
        <h3>⚖️ Judge Evaluation</h3>
        <div className={`final-verdict ${finalVerdictStyle.className}`}>
          <span className="verdict-icon">{finalVerdictStyle.icon}</span>
          <span className="verdict-label">{finalVerdictStyle.label}</span>
          <span className="confidence-badge" style={{ backgroundColor: getConfidenceColor(confidence) }}>
            {(confidence * 100).toFixed(1)}% confidence
          </span>
        </div>
      </div>

      <div className="panel-content">
        {/* Primary Judge */}
        <div className="judge-section">
          <div className="judge-header">
            <h4>Primary Judge (GPT-4)</h4>
            <div className={`verdict-badge ${primaryVerdictStyle.className}`}>
              {primaryVerdictStyle.icon} {primaryVerdictStyle.label}
            </div>
          </div>

          <div className="judge-details">
            <div className="detail-row">
              <span className="detail-label">Confidence:</span>
              <div className="confidence-bar">
                <div
                  className="confidence-fill"
                  style={{
                    width: `${(primaryJudge?.confidence || 0) * 100}%`,
                    backgroundColor: getConfidenceColor(primaryJudge?.confidence || 0)
                  }}
                />
                <span className="confidence-text">
                  {((primaryJudge?.confidence || 0) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="detail-row">
              <span className="detail-label">Reasoning:</span>
              <div className="reasoning-text">
                {primaryJudge?.reasoning || 'No reasoning provided'}
              </div>
            </div>

            {primaryJudge?.excerpts && primaryJudge.excerpts.length > 0 && (
              <div className="detail-row">
                <span className="detail-label">Evidence Excerpts:</span>
                <div className="excerpts-list">
                  {primaryJudge.excerpts.map((excerpt, idx) => (
                    <div key={idx} className="excerpt-item">
                      <span className="excerpt-number">{idx + 1}.</span>
                      <span className="excerpt-text">"{excerpt}"</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-row meta">
              <span className="detail-label">Model:</span>
              <span className="meta-value">{primaryJudge?.model || 'gpt-4-turbo'}</span>
              <span className="detail-label">Timestamp:</span>
              <span className="meta-value">
                {primaryJudge?.timestamp ? new Date(primaryJudge.timestamp).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Judge */}
        {secondaryJudge && (
          <div className="judge-section secondary">
            <div className="judge-header">
              <h4>Secondary Judge (Validation Layer)</h4>
              {secondaryJudge.overridden && (
                <div className="override-badge">
                  ⚠️ OVERRIDDEN
                </div>
              )}
            </div>

            <div className="judge-details">
              <div className="detail-row">
                <span className="detail-label">Original Verdict:</span>
                <span className={`verdict-inline ${getVerdictStyle(secondaryJudge.originalVerdict).className}`}>
                  {getVerdictStyle(secondaryJudge.originalVerdict).icon} {getVerdictStyle(secondaryJudge.originalVerdict).label}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Adjusted Verdict:</span>
                <span className={`verdict-inline ${getVerdictStyle(secondaryJudge.adjustedVerdict).className}`}>
                  {getVerdictStyle(secondaryJudge.adjustedVerdict).icon} {getVerdictStyle(secondaryJudge.adjustedVerdict).label}
                </span>
              </div>

              {secondaryJudge.overridden && (
                <>
                  <div className="detail-row">
                    <span className="detail-label">Override Reason:</span>
                    <span className={`override-reason ${secondaryJudge.overrideReason}`}>
                      {secondaryJudge.overrideReason === 'false_negative' ? '🔍 False Negative Detected' :
                       secondaryJudge.overrideReason === 'false_positive' ? '⚠️ False Positive Detected' :
                       secondaryJudge.overrideReason}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">Validation Reasoning:</span>
                    <div className="reasoning-text highlighted">
                      {secondaryJudge.reasoning}
                    </div>
                  </div>
                </>
              )}

              {!secondaryJudge.overridden && (
                <div className="detail-row">
                  <div className="agreement-message">
                    ✓ Secondary judge agrees with primary assessment
                  </div>
                </div>
              )}

              <div className="detail-row">
                <span className="detail-label">Confidence:</span>
                <div className="confidence-bar">
                  <div
                    className="confidence-fill"
                    style={{
                      width: `${(secondaryJudge.confidence || 0) * 100}%`,
                      backgroundColor: getConfidenceColor(secondaryJudge.confidence || 0)
                    }}
                  />
                  <span className="confidence-text">
                    {((secondaryJudge.confidence || 0) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {evaluation.error && (
          <div className="evaluation-error">
            <div className="error-icon">⚠️</div>
            <div className="error-message">
              <strong>Evaluation Error:</strong> {evaluation.error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JudgeEvaluationView;
