import React from 'react';
import '../../styles/DetectionMetricsPanel.css';

const DetectionMetricsPanel = ({ detectionResults, trajectory }) => {
  if (!detectionResults) {
    return (
      <div className="detection-metrics-panel">
        <div className="panel-header">
          <h3>🔍 Attack Detection</h3>
        </div>
        <div className="panel-content">
          <div className="detection-empty">
            No detection results available
          </div>
        </div>
      </div>
    );
  }

  const {
    detected,
    confidence,
    patterns,
    redFlags,
    trajectory: detectionTrajectory,
    recommendation
  } = detectionResults;

  /**
   * Get recommendation style
   */
  const getRecommendationStyle = (rec) => {
    const styles = {
      'BLOCK': { className: 'rec-block', icon: '🚫', label: 'BLOCK' },
      'WARN': { className: 'rec-warn', icon: '⚠️', label: 'WARN' },
      'MONITOR': { className: 'rec-monitor', icon: '👁️', label: 'MONITOR' },
      'ALLOW': { className: 'rec-allow', icon: '✓', label: 'ALLOW' }
    };
    return styles[rec] || styles.MONITOR;
  };

  const recStyle = getRecommendationStyle(recommendation);

  /**
   * Get confidence color
   */
  const getConfidenceColor = (conf) => {
    if (conf >= 0.8) return '#ef4444'; // Red - high confidence attack
    if (conf >= 0.6) return '#f97316'; // Orange
    if (conf >= 0.4) return '#eab308'; // Yellow
    return '#22c55e'; // Green - low confidence
  };

  /**
   * Get severity badge
   */
  const getSeverityBadge = (severity) => {
    const badges = {
      'high': { className: 'severity-high', icon: '🔴' },
      'medium': { className: 'severity-medium', icon: '🟡' },
      'low': { className: 'severity-low', icon: '🟢' }
    };
    return badges[severity] || badges.low;
  };

  return (
    <div className="detection-metrics-panel">
      <div className="panel-header">
        <h3>🔍 Attack Detection</h3>
      </div>

      <div className="panel-content">
        {/* Detection Status */}
        <div className="detection-status">
          <div className={`status-indicator ${detected ? 'status-detected' : 'status-safe'}`}>
            {detected ? '⚠️ Attack Detected' : '✓ No Attack Detected'}
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="detection-section">
          <h4 className="section-title">Detection Confidence</h4>

          <div className="confidence-meter">
            <div className="confidence-bar-container">
              <div
                className="confidence-bar-fill"
                style={{
                  width: `${confidence * 100}%`,
                  backgroundColor: getConfidenceColor(confidence)
                }}
              ></div>
            </div>
            <div className="confidence-value" style={{ color: getConfidenceColor(confidence) }}>
              {(confidence * 100).toFixed(1)}%
            </div>
          </div>

          <div className="confidence-labels">
            <span className="confidence-label-low">Low</span>
            <span className="confidence-label-med">Medium</span>
            <span className="confidence-label-high">High</span>
          </div>
        </div>

        {/* Recommendation */}
        <div className="detection-section">
          <h4 className="section-title">Recommendation</h4>

          <div className={`recommendation-badge ${recStyle.className}`}>
            <span className="recommendation-icon">{recStyle.icon}</span>
            <span className="recommendation-label">{recStyle.label}</span>
          </div>

          <div className="recommendation-description">
            {recommendation === 'BLOCK' && 'High confidence attack detected. Block this request.'}
            {recommendation === 'WARN' && 'Potential attack detected. Review and monitor closely.'}
            {recommendation === 'MONITOR' && 'Suspicious patterns detected. Continue monitoring.'}
            {recommendation === 'ALLOW' && 'Low risk detected. Safe to proceed with monitoring.'}
          </div>
        </div>

        {/* Detected Patterns */}
        {patterns && patterns.length > 0 && (
          <div className="detection-section">
            <h4 className="section-title">Detected Patterns</h4>

            <div className="patterns-list">
              {patterns.map((pattern, idx) => (
                <div key={idx} className="pattern-item">
                  <div className="pattern-header">
                    <span className="pattern-name">
                      {pattern.name.replace(/_/g, ' ')}
                    </span>
                    <span className="pattern-confidence">
                      {(pattern.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="pattern-progress">
                    <div
                      className="pattern-progress-fill"
                      style={{
                        width: `${pattern.confidence * 100}%`,
                        backgroundColor: getConfidenceColor(pattern.confidence)
                      }}
                    ></div>
                  </div>

                  {pattern.indicators && pattern.indicators.length > 0 && (
                    <div className="pattern-indicators">
                      {pattern.indicators.slice(0, 3).map((indicator, iIdx) => (
                        <div key={iIdx} className="indicator-item">
                          • {indicator}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Red Flags */}
        {redFlags && redFlags.length > 0 && (
          <div className="detection-section">
            <h4 className="section-title">Red Flags ({redFlags.length})</h4>

            <div className="redflags-list">
              {redFlags.map((flag, idx) => {
                const severityBadge = getSeverityBadge(flag.severity);
                return (
                  <div key={idx} className="redflag-item">
                    <div className="redflag-header">
                      <span className={`redflag-severity ${severityBadge.className}`}>
                        {severityBadge.icon}
                      </span>
                      <span className="redflag-turn">Turn {flag.turn}</span>
                    </div>
                    <div className="redflag-message">
                      {flag.flag.replace(/_/g, ' ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Escalation Trajectory */}
        {(detectionTrajectory || trajectory) && (
          <div className="detection-section">
            <h4 className="section-title">Escalation Trajectory</h4>

            {(() => {
              const traj = detectionTrajectory || trajectory;
              return (
                <div className="trajectory-metrics">
                  <div className="trajectory-item">
                    <span className="trajectory-label">Status:</span>
                    <span className={`trajectory-value ${traj.escalating ? 'trajectory-escalating' : 'trajectory-flat'}`}>
                      {traj.escalating ? '↗ Escalating' : '→ Flat'}
                    </span>
                  </div>

                  <div className="trajectory-item">
                    <span className="trajectory-label">Trend:</span>
                    <span className="trajectory-value">
                      {traj.trend === 'increasing' && '↗ Increasing'}
                      {traj.trend === 'decreasing' && '↘ Decreasing'}
                      {traj.trend === 'stable' && '→ Stable'}
                    </span>
                  </div>

                  {traj.escalationRate !== undefined && (
                    <div className="trajectory-item">
                      <span className="trajectory-label">Rate:</span>
                      <span className="trajectory-value">
                        {(traj.escalationRate * 100).toFixed(2)}% per turn
                      </span>
                    </div>
                  )}

                  {traj.averageCompliance !== undefined && (
                    <div className="trajectory-item">
                      <span className="trajectory-label">Avg Compliance:</span>
                      <span className="trajectory-value">
                        {(traj.averageCompliance * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Detection Summary */}
        <div className="detection-section">
          <h4 className="section-title">Summary</h4>

          <div className="detection-summary">
            {detected ? (
              <>
                <p className="summary-text">
                  This conversation exhibits characteristics of a Crescendo attack with{' '}
                  <strong style={{ color: getConfidenceColor(confidence) }}>
                    {(confidence * 100).toFixed(1)}% confidence
                  </strong>.
                </p>

                {patterns && patterns.length > 0 && (
                  <p className="summary-text">
                    Detected {patterns.length} attack pattern{patterns.length > 1 ? 's' : ''}:
                    {' '}
                    {patterns.map(p => p.name.replace(/_/g, ' ')).join(', ')}.
                  </p>
                )}

                {redFlags && redFlags.length > 0 && (
                  <p className="summary-text">
                    Found {redFlags.length} red flag{redFlags.length > 1 ? 's' : ''} across the conversation.
                  </p>
                )}

                <p className="summary-recommendation">
                  Recommended action: <strong>{recommendation}</strong>
                </p>
              </>
            ) : (
              <p className="summary-text">
                No significant attack patterns detected. The conversation appears to be within normal parameters.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetectionMetricsPanel;
