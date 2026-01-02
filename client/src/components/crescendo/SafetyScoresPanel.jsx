import React from 'react';
import '../../styles/SafetyScoresPanel.css';

const SafetyScoresPanel = ({ externalScores }) => {
  if (!externalScores) {
    return (
      <div className="safety-scores-panel">
        <div className="panel-header">
          <h3>🛡️ External Safety Scores</h3>
        </div>
        <div className="panel-content">
          <div className="scores-empty">
            No external safety scores available. Enable external scoring to see results.
          </div>
        </div>
      </div>
    );
  }

  const { perspective, azure, combined } = externalScores;

  const getScoreColor = (score) => {
    if (score >= 0.8) return '#ef4444'; // Red - very high risk
    if (score >= 0.6) return '#f97316'; // Orange - high risk
    if (score >= 0.4) return '#eab308'; // Yellow - medium risk
    if (score >= 0.2) return '#3b82f6'; // Blue - low risk
    return '#10b981'; // Green - minimal risk
  };

  const getHarmfulnessStyle = (level) => {
    const styles = {
      'very_high': { className: 'harm-very-high', icon: '🔴', label: 'Very High' },
      'high': { className: 'harm-high', icon: '🟠', label: 'High' },
      'medium': { className: 'harm-medium', icon: '🟡', label: 'Medium' },
      'low': { className: 'harm-low', icon: '🔵', label: 'Low' },
      'minimal': { className: 'harm-minimal', icon: '🟢', label: 'Minimal' },
      'unknown': { className: 'harm-unknown', icon: '⚪', label: 'Unknown' }
    };
    return styles[level] || styles.unknown;
  };

  const ScoreBar = ({ label, score, available = true }) => (
    <div className="score-row">
      <span className="score-label">{label}:</span>
      <div className="score-bar">
        {available ? (
          <>
            <div
              className="score-fill"
              style={{
                width: `${score * 100}%`,
                backgroundColor: getScoreColor(score)
              }}
            />
            <span className="score-text">{(score * 100).toFixed(1)}%</span>
          </>
        ) : (
          <span className="score-unavailable">Not available</span>
        )}
      </div>
    </div>
  );

  const harmfulnessStyle = getHarmfulnessStyle(combined?.harmfulnessLevel);

  return (
    <div className="safety-scores-panel">
      <div className="panel-header">
        <h3>🛡️ External Safety Scores</h3>
        {combined && (
          <div className={`harmfulness-badge ${harmfulnessStyle.className}`}>
            <span className="harm-icon">{harmfulnessStyle.icon}</span>
            <span className="harm-label">{harmfulnessStyle.label} Risk</span>
            <span className="harm-score">{(combined.overall * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div className="panel-content">
        {/* Combined Score */}
        {combined && (
          <div className="score-section combined">
            <h4>📊 Combined Harmfulness Score</h4>
            <div className="combined-score-display">
              <div className="score-circle" style={{ borderColor: getScoreColor(combined.overall) }}>
                <div className="score-value">{(combined.overall * 100).toFixed(1)}%</div>
                <div className="score-subtitle">Overall</div>
              </div>
              <div className="score-components">
                <div className="component-item">
                  <span className="component-label">Google Perspective Avg:</span>
                  <span className="component-value" style={{ color: getScoreColor(combined.perspectiveAvg) }}>
                    {(combined.perspectiveAvg * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="component-item">
                  <span className="component-label">Azure Max Severity:</span>
                  <span className="component-value" style={{ color: getScoreColor(combined.azureMax) }}>
                    {(combined.azureMax * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Google Perspective Scores */}
        <div className="score-section">
          <div className="section-header">
            <h4>🔍 Google Perspective API</h4>
            {perspective?.available ? (
              <span className="api-status available">✓ Available</span>
            ) : (
              <span className="api-status unavailable">✗ Unavailable</span>
            )}
          </div>

          {perspective?.available ? (
            <div className="scores-grid">
              <ScoreBar label="Toxicity" score={perspective.toxicity} />
              <ScoreBar label="Severe Toxicity" score={perspective.severeToxicity} />
              <ScoreBar label="Identity Attack" score={perspective.identityAttack} />
              <ScoreBar label="Insult" score={perspective.insult} />
              <ScoreBar label="Profanity" score={perspective.profanity} />
              <ScoreBar label="Threat" score={perspective.threat} />
            </div>
          ) : (
            <div className="api-error">
              <span className="error-icon">⚠️</span>
              <span className="error-text">
                {perspective?.error || 'Google Perspective API not configured'}
              </span>
            </div>
          )}
        </div>

        {/* Azure Content Safety Scores */}
        <div className="score-section">
          <div className="section-header">
            <h4>🔒 Microsoft Azure Content Safety</h4>
            {azure?.available ? (
              <span className="api-status available">✓ Available</span>
            ) : (
              <span className="api-status unavailable">✗ Unavailable</span>
            )}
          </div>

          {azure?.available ? (
            <div className="scores-grid">
              <ScoreBar label="Hate Speech" score={azure.hate} />
              <ScoreBar label="Self-harm" score={azure.selfHarm} />
              <ScoreBar label="Sexual Content" score={azure.sexual} />
              <ScoreBar label="Violence" score={azure.violence} />
            </div>
          ) : (
            <div className="api-error">
              <span className="error-icon">⚠️</span>
              <span className="error-text">
                {azure?.error || 'Azure Content Safety API not configured'}
              </span>
            </div>
          )}
        </div>

        {/* API Info Footer */}
        <div className="api-info">
          <div className="info-item">
            <span className="info-icon">ℹ️</span>
            <span className="info-text">
              External scores provide objective safety measurements from third-party APIs
            </span>
          </div>
          {externalScores.timestamp && (
            <div className="info-item">
              <span className="info-label">Scored at:</span>
              <span className="info-value">{new Date(externalScores.timestamp).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Configuration Warning */}
        {(!perspective?.available && !azure?.available) && (
          <div className="config-warning">
            <div className="warning-icon">⚠️</div>
            <div className="warning-content">
              <strong>No external APIs configured</strong>
              <p>Set environment variables to enable external safety scoring:</p>
              <ul>
                <li><code>GOOGLE_PERSPECTIVE_API_KEY</code></li>
                <li><code>AZURE_CONTENT_SAFETY_KEY</code> and <code>AZURE_CONTENT_SAFETY_ENDPOINT</code></li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyScoresPanel;
