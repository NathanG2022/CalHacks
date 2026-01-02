import React, { useState, useEffect } from 'react';
import '../../styles/ResultsStatisticsPanel.css';
import { getEvaluationStatistics } from '../../services/evaluation';

const ResultsStatisticsPanel = ({ currentExecution }) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStatistics();
  }, [currentExecution]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const stats = await getEvaluationStatistics();
      setStatistics(stats);
      setError(null);
    } catch (err) {
      console.error('Failed to load statistics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="results-statistics-panel">
        <div className="panel-header">
          <h3>📊 Attack Statistics & Benchmarks</h3>
        </div>
        <div className="panel-content">
          <div className="loading-spinner">Loading statistics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-statistics-panel">
        <div className="panel-header">
          <h3>📊 Attack Statistics & Benchmarks</h3>
        </div>
        <div className="panel-content">
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!statistics || statistics.summary?.totalExecutions === 0) {
    return (
      <div className="results-statistics-panel">
        <div className="panel-header">
          <h3>📊 Attack Statistics & Benchmarks</h3>
        </div>
        <div className="panel-content">
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <div className="empty-text">
              <p>No evaluation data available yet</p>
              <p className="empty-subtext">Run attacks with evaluation enabled to see statistics</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { successRate, strategyComparison, safetyScores, judgeMetrics, complianceProgression, recommendations, summary } = statistics;

  const getSuccessRateColor = (rate) => {
    if (rate >= 0.7) return '#ef4444'; // Red - high success (bad for defender)
    if (rate >= 0.5) return '#f97316'; // Orange
    if (rate >= 0.3) return '#eab308'; // Yellow
    if (rate >= 0.1) return '#3b82f6'; // Blue
    return '#10b981'; // Green - low success (good for defender)
  };

  return (
    <div className="results-statistics-panel">
      <div className="panel-header">
        <h3>📊 Attack Statistics & Benchmarks</h3>
        <button className="refresh-btn" onClick={loadStatistics}>
          🔄 Refresh
        </button>
      </div>

      <div className="panel-content">
        {/* Executive Summary */}
        <div className="stats-section summary">
          <h4>📋 Executive Summary</h4>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="card-label">Total Executions</div>
              <div className="card-value">{summary.totalExecutions}</div>
            </div>
            <div className="summary-card">
              <div className="card-label">Success Rate</div>
              <div className="card-value" style={{ color: getSuccessRateColor(parseFloat(successRate.rate)) }}>
                {summary.successRate}
              </div>
            </div>
            <div className="summary-card">
              <div className="card-label">Best Strategy</div>
              <div className="card-value">{summary.bestStrategy || 'N/A'}</div>
            </div>
            <div className="summary-card">
              <div className="card-label">Avg Confidence</div>
              <div className="card-value">{summary.avgConfidence}</div>
            </div>
          </div>
        </div>

        {/* Success Rate Details */}
        <div className="stats-section">
          <h4>🎯 Success Rate Analysis</h4>
          <div className="success-details">
            <div className="success-gauge">
              <svg viewBox="0 0 200 120" className="gauge-svg">
                {/* Background arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="20"
                />
                {/* Success arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke={getSuccessRateColor(successRate.rate)}
                  strokeWidth="20"
                  strokeDasharray={`${successRate.rate * 251.2} 251.2`}
                  className="gauge-fill"
                />
                <text x="100" y="85" textAnchor="middle" className="gauge-text">
                  {successRate.percentage}%
                </text>
                <text x="100" y="105" textAnchor="middle" className="gauge-subtitle">
                  Success Rate
                </text>
              </svg>
            </div>
            <div className="success-stats">
              <div className="stat-row">
                <span className="stat-label">Successful Attacks:</span>
                <span className="stat-value">{successRate.successful}/{successRate.total}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Failed Attacks:</span>
                <span className="stat-value">{successRate.failed}/{successRate.total}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Avg Confidence:</span>
                <span className="stat-value">{successRate.avgConfidence}</span>
              </div>
              {successRate.confidenceRange && (
                <div className="stat-row">
                  <span className="stat-label">Confidence Range:</span>
                  <span className="stat-value">
                    {successRate.confidenceRange.min.toFixed(2)} - {successRate.confidenceRange.max.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Strategy Comparison */}
        {strategyComparison?.ranked && strategyComparison.ranked.length > 0 && (
          <div className="stats-section">
            <h4>🔀 Strategy Performance Comparison</h4>
            <div className="strategy-table">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Strategy</th>
                    <th>Attempts</th>
                    <th>Success Rate</th>
                    <th>Avg Compliance</th>
                    <th>Avg Turns</th>
                  </tr>
                </thead>
                <tbody>
                  {strategyComparison.ranked.map((strategy) => (
                    <tr key={strategy.name} className={strategy.rank === 1 ? 'best-strategy' : ''}>
                      <td>#{strategy.rank}</td>
                      <td className="strategy-name">{strategy.name}</td>
                      <td>{strategy.attempts}</td>
                      <td>
                        <div className="inline-bar">
                          <div
                            className="inline-fill"
                            style={{
                              width: `${parseFloat(strategy.successPercentage)}%`,
                              backgroundColor: getSuccessRateColor(parseFloat(strategy.successRate))
                            }}
                          />
                          <span className="inline-text">{strategy.successPercentage}%</span>
                        </div>
                      </td>
                      <td>{strategy.avgCompliance}</td>
                      <td>{strategy.avgTurns}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Judge Performance */}
        {judgeMetrics?.available && (
          <div className="stats-section">
            <h4>⚖️ Judge Performance Metrics</h4>
            <div className="judge-stats-grid">
              <div className="judge-stat">
                <div className="judge-stat-label">Total Evaluations</div>
                <div className="judge-stat-value">{judgeMetrics.total}</div>
              </div>
              <div className="judge-stat">
                <div className="judge-stat-label">Judge Agreement</div>
                <div className="judge-stat-value">{(parseFloat(judgeMetrics.agreementRate) * 100).toFixed(1)}%</div>
              </div>
              <div className="judge-stat">
                <div className="judge-stat-label">Overrides</div>
                <div className="judge-stat-value">{judgeMetrics.disagreements}</div>
              </div>
              <div className="judge-stat">
                <div className="judge-stat-label">False Negatives Caught</div>
                <div className="judge-stat-value warning">{judgeMetrics.falseNegativesDetected}</div>
              </div>
              <div className="judge-stat">
                <div className="judge-stat-label">False Positives Caught</div>
                <div className="judge-stat-value warning">{judgeMetrics.falsePositivesDetected}</div>
              </div>
              <div className="judge-stat">
                <div className="judge-stat-label">Override Rate</div>
                <div className="judge-stat-value">{(parseFloat(judgeMetrics.overrideRate) * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Progression */}
        {complianceProgression?.available && (
          <div className="stats-section">
            <h4>📈 Compliance Progression</h4>
            <div className="compliance-stats">
              <div className="compliance-row">
                <span className="compliance-label">Initial Compliance:</span>
                <div className="compliance-bar">
                  <div
                    className="compliance-fill"
                    style={{ width: `${parseFloat(complianceProgression.avgInitialCompliance) * 100}%` }}
                  />
                  <span className="compliance-text">{(parseFloat(complianceProgression.avgInitialCompliance) * 100).toFixed(1)}%</span>
                </div>
              </div>
              <div className="compliance-row">
                <span className="compliance-label">Final Compliance:</span>
                <div className="compliance-bar">
                  <div
                    className="compliance-fill final"
                    style={{ width: `${parseFloat(complianceProgression.avgFinalCompliance) * 100}%` }}
                  />
                  <span className="compliance-text">{(parseFloat(complianceProgression.avgFinalCompliance) * 100).toFixed(1)}%</span>
                </div>
              </div>
              <div className="compliance-row">
                <span className="compliance-label">Improvement:</span>
                <span className="compliance-improvement">
                  +{complianceProgression.improvementPercentage}% ({complianceProgression.avgImprovement})
                </span>
              </div>
              <div className="compliance-row">
                <span className="compliance-label">Escalation Rate:</span>
                <span className="compliance-value">{complianceProgression.avgEscalationRate}</span>
              </div>
            </div>
          </div>
        )}

        {/* Safety Scores Summary */}
        {safetyScores?.available && (
          <div className="stats-section">
            <h4>🛡️ External Safety Scores Summary</h4>
            <div className="safety-summary">
              <div className="safety-api">
                <h5>Google Perspective (Avg)</h5>
                <div className="safety-scores-grid">
                  {Object.entries(safetyScores.perspective).map(([key, value]) => (
                    <div key={key} className="safety-score-item">
                      <span className="score-name">{key}:</span>
                      <span className="score-val">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="safety-api">
                <h5>Azure Content Safety (Avg)</h5>
                <div className="safety-scores-grid">
                  {Object.entries(safetyScores.azure).map(([key, value]) => (
                    <div key={key} className="safety-score-item">
                      <span className="score-name">{key}:</span>
                      <span className="score-val">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {safetyScores.highestRisk && (
                <div className="highest-risk">
                  <span className="risk-label">Highest Risk Category:</span>
                  <span className="risk-category">{safetyScores.highestRisk.category}</span>
                  <span className="risk-score">({(safetyScores.highestRisk.score * 100).toFixed(1)}%)</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="stats-section recommendations">
            <h4>💡 Recommendations</h4>
            <div className="recommendations-list">
              {recommendations.map((rec, idx) => (
                <div key={idx} className={`recommendation-item ${rec.type} ${rec.priority}`}>
                  <span className="rec-icon">
                    {rec.type === 'warning' ? '⚠️' : rec.type === 'info' ? 'ℹ️' : '💡'}
                  </span>
                  <div className="rec-content">
                    <span className="rec-category">{rec.category.toUpperCase()}:</span>
                    <span className="rec-message">{rec.message}</span>
                  </div>
                  <span className={`rec-priority ${rec.priority}`}>
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsStatisticsPanel;
