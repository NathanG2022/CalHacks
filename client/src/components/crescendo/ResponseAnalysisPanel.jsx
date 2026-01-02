import React from 'react';
import '../../styles/ResponseAnalysisPanel.css';

const ResponseAnalysisPanel = ({ analysisResults, executionMetadata }) => {
  /**
   * Get color for compliance level
   */
  const getComplianceColor = (level) => {
    if (level >= 0.8) return '#22c55e'; // Green
    if (level >= 0.6) return '#84cc16'; // Light green
    if (level >= 0.4) return '#eab308'; // Yellow
    if (level >= 0.2) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  /**
   * Calculate compliance progression
   */
  const complianceLevels = analysisResults.map(a => a.complianceLevel);
  const maxCompliance = executionMetadata?.maxCompliance || Math.max(...complianceLevels);
  const minCompliance = executionMetadata?.minCompliance || Math.min(...complianceLevels);
  const avgCompliance = executionMetadata?.averageCompliance || 0;
  const escalationRate = executionMetadata?.escalationRate || 0;

  /**
   * Get trend indicator
   */
  const getTrendIndicator = () => {
    const trajectory = executionMetadata?.trajectory;
    if (!trajectory) return { icon: '→', label: 'Unknown', className: 'trend-neutral' };

    if (trajectory.trend === 'increasing') {
      return { icon: '↗', label: 'Increasing', className: 'trend-positive' };
    } else if (trajectory.trend === 'decreasing') {
      return { icon: '↘', label: 'Decreasing', className: 'trend-negative' };
    }
    return { icon: '→', label: 'Stable', className: 'trend-neutral' };
  };

  const trend = getTrendIndicator();

  /**
   * Get classification distribution
   */
  const getClassificationDistribution = () => {
    const distribution = {
      full_compliance: 0,
      partial_compliance: 0,
      partial_refusal: 0,
      full_refusal: 0,
      unknown: 0
    };

    analysisResults.forEach(result => {
      const classification = result.complianceClassification || 'unknown';
      distribution[classification] = (distribution[classification] || 0) + 1;
    });

    return distribution;
  };

  const distribution = getClassificationDistribution();

  return (
    <div className="response-analysis-panel">
      <div className="panel-header">
        <h3>📊 Response Analysis</h3>
      </div>

      <div className="panel-content">
        {/* Compliance Overview */}
        <div className="analysis-section">
          <h4 className="section-title">Compliance Metrics</h4>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Average</div>
              <div className="metric-value" style={{ color: getComplianceColor(avgCompliance) }}>
                {(avgCompliance * 100).toFixed(1)}%
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Maximum</div>
              <div className="metric-value" style={{ color: getComplianceColor(maxCompliance) }}>
                {(maxCompliance * 100).toFixed(1)}%
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Minimum</div>
              <div className="metric-value" style={{ color: getComplianceColor(minCompliance) }}>
                {(minCompliance * 100).toFixed(1)}%
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Trend</div>
              <div className={`metric-value ${trend.className}`}>
                {trend.icon} {trend.label}
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Progression Chart */}
        <div className="analysis-section">
          <h4 className="section-title">Compliance Progression</h4>

          <div className="progression-chart">
            <div className="chart-y-axis">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            <div className="chart-area">
              <div className="chart-grid">
                <div className="grid-line"></div>
                <div className="grid-line"></div>
                <div className="grid-line"></div>
                <div className="grid-line"></div>
              </div>

              <svg className="chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline
                  points={complianceLevels.map((level, idx) => {
                    const x = (idx / (complianceLevels.length - 1)) * 100;
                    const y = 100 - (level * 100);
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />

                {complianceLevels.map((level, idx) => {
                  const x = (idx / (complianceLevels.length - 1)) * 100;
                  const y = 100 - (level * 100);
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="3"
                      fill={getComplianceColor(level)}
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
              </svg>
            </div>

            <div className="chart-x-axis">
              {complianceLevels.map((_, idx) => (
                <span key={idx}>T{idx + 1}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Classification Distribution */}
        <div className="analysis-section">
          <h4 className="section-title">Response Classifications</h4>

          <div className="classification-list">
            {distribution.full_compliance > 0 && (
              <div className="classification-item">
                <span className="classification-badge badge-success">✓ Full Compliance</span>
                <span className="classification-count">{distribution.full_compliance}</span>
              </div>
            )}

            {distribution.partial_compliance > 0 && (
              <div className="classification-item">
                <span className="classification-badge badge-warning">○ Partial Compliance</span>
                <span className="classification-count">{distribution.partial_compliance}</span>
              </div>
            )}

            {distribution.partial_refusal > 0 && (
              <div className="classification-item">
                <span className="classification-badge badge-warning">△ Partial Refusal</span>
                <span className="classification-count">{distribution.partial_refusal}</span>
              </div>
            )}

            {distribution.full_refusal > 0 && (
              <div className="classification-item">
                <span className="classification-badge badge-danger">✗ Full Refusal</span>
                <span className="classification-count">{distribution.full_refusal}</span>
              </div>
            )}
          </div>
        </div>

        {/* Turn-by-Turn Analysis */}
        <div className="analysis-section">
          <h4 className="section-title">Turn Details</h4>

          <div className="turn-details-list">
            {analysisResults.map((result, idx) => (
              <div key={idx} className="turn-detail-item">
                <div className="turn-detail-header">
                  <span className="turn-detail-number">Turn {idx + 1}</span>
                  <span
                    className="turn-detail-compliance"
                    style={{ color: getComplianceColor(result.complianceLevel) }}
                  >
                    {(result.complianceLevel * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="turn-detail-body">
                  <div className="turn-detail-row">
                    <span className="detail-label">Classification:</span>
                    <span className="detail-value">
                      {result.complianceClassification.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {result.refusalDetected && (
                    <div className="turn-detail-row">
                      <span className="detail-label">Refusal:</span>
                      <span className="detail-value refusal-text">
                        {result.refusalIndicators.slice(0, 2).join(', ')}
                      </span>
                    </div>
                  )}

                  {result.keyPhrases && result.keyPhrases.length > 0 && (
                    <div className="turn-detail-row">
                      <span className="detail-label">Key Phrases:</span>
                      <span className="detail-value">
                        {result.keyPhrases.length} extracted
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="turn-detail-progress">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${result.complianceLevel * 100}%`,
                      backgroundColor: getComplianceColor(result.complianceLevel)
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategy Information */}
        {executionMetadata?.strategyHistory && executionMetadata.strategyHistory.length > 0 && (
          <div className="analysis-section">
            <h4 className="section-title">Strategy History</h4>

            <div className="strategy-history-list">
              {executionMetadata.strategyHistory.map((entry, idx) => (
                <div key={idx} className="strategy-history-item">
                  <div className="strategy-history-header">
                    <span className="strategy-name">{entry.strategy}</span>
                    <span className="strategy-turn">Turn {entry.turn}</span>
                  </div>
                  <div className="strategy-reason">
                    {entry.reason.replace(/_/g, ' ')}
                  </div>
                  {entry.previousStrategy && (
                    <div className="strategy-pivot">
                      Pivoted from: {entry.previousStrategy}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseAnalysisPanel;
