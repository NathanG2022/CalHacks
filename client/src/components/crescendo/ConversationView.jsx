import React, { useState } from 'react';
import '../../styles/ConversationView.css';

const ConversationView = ({ conversation, strategy }) => {
  const [expandedTurns, setExpandedTurns] = useState(new Set());

  /**
   * Toggle turn expansion
   */
  const toggleTurn = (turnNumber) => {
    const newExpanded = new Set(expandedTurns);
    if (newExpanded.has(turnNumber)) {
      newExpanded.delete(turnNumber);
    } else {
      newExpanded.add(turnNumber);
    }
    setExpandedTurns(newExpanded);
  };

  /**
   * Group messages by turn
   */
  const groupMessagesByTurn = () => {
    const turns = [];
    for (let i = 0; i < conversation.length; i += 2) {
      const userMsg = conversation[i];
      const assistantMsg = conversation[i + 1];

      if (userMsg && assistantMsg) {
        turns.push({
          number: userMsg.turnNumber,
          userMessage: userMsg,
          assistantMessage: assistantMsg
        });
      }
    }
    return turns;
  };

  const turns = groupMessagesByTurn();

  /**
   * Get compliance badge style
   */
  const getComplianceBadge = (level) => {
    if (level >= 0.8) return { className: 'badge-high', label: 'High Compliance' };
    if (level >= 0.6) return { className: 'badge-medium-high', label: 'Medium-High' };
    if (level >= 0.4) return { className: 'badge-medium', label: 'Medium' };
    if (level >= 0.2) return { className: 'badge-low', label: 'Low Compliance' };
    return { className: 'badge-very-low', label: 'Refusal' };
  };

  /**
   * Get classification badge style
   */
  const getClassificationBadge = (classification) => {
    const badges = {
      'full_compliance': { className: 'badge-success', icon: '✓' },
      'partial_compliance': { className: 'badge-warning', icon: '○' },
      'partial_refusal': { className: 'badge-warning', icon: '△' },
      'full_refusal': { className: 'badge-danger', icon: '✗' },
      'unknown': { className: 'badge-neutral', icon: '?' }
    };
    return badges[classification] || badges.unknown;
  };

  /**
   * Truncate text for preview
   */
  const truncateText = (text, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="conversation-view">
      <div className="conversation-header">
        <h3>💬 Conversation Thread</h3>
        {strategy && (
          <div className="conversation-strategy">
            <span className="strategy-badge">{strategy.framing}</span>
          </div>
        )}
      </div>

      <div className="conversation-content">
        {turns.length === 0 ? (
          <div className="conversation-empty">
            No conversation yet. Execute an attack to see the conversation.
          </div>
        ) : (
          turns.map(turn => {
            const isExpanded = expandedTurns.has(turn.number);
            const metadata = turn.assistantMessage.metadata || {};
            const complianceBadge = getComplianceBadge(metadata.complianceLevel || 0);
            const classificationBadge = getClassificationBadge(metadata.complianceClassification);

            return (
              <div key={turn.number} className="turn-container">
                {/* Turn Header */}
                <div
                  className="turn-header"
                  onClick={() => toggleTurn(turn.number)}
                >
                  <div className="turn-header-left">
                    <span className="turn-number">Turn {turn.number}</span>
                    <span className="turn-expand-icon">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </div>
                  <div className="turn-header-right">
                    <span className={`compliance-badge ${complianceBadge.className}`}>
                      {complianceBadge.label}
                    </span>
                    <span className={`classification-badge ${classificationBadge.className}`}>
                      {classificationBadge.icon}
                    </span>
                  </div>
                </div>

                {/* Turn Content */}
                {isExpanded && (
                  <div className="turn-content">
                    {/* User Message */}
                    <div className="message-container user-message">
                      <div className="message-header">
                        <span className="message-role">👤 User</span>
                      </div>
                      <div className="message-body">
                        {turn.userMessage.content}
                      </div>
                    </div>

                    {/* Assistant Message */}
                    <div className="message-container assistant-message">
                      <div className="message-header">
                        <span className="message-role">🤖 Assistant</span>
                        <div className="message-metadata">
                          <span className="metadata-item">
                            Compliance: {((metadata.complianceLevel || 0) * 100).toFixed(1)}%
                          </span>
                          {metadata.refusalDetected && (
                            <span className="metadata-item refusal-indicator">
                              ⚠️ Refusal
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="message-body">
                        {turn.assistantMessage.content}
                      </div>

                      {/* Key Phrases */}
                      {metadata.keyPhrases && metadata.keyPhrases.length > 0 && (
                        <div className="message-keyphrases">
                          <div className="keyphrases-header">Key Phrases Extracted:</div>
                          <div className="keyphrases-list">
                            {metadata.keyPhrases.slice(0, 5).map((phrase, idx) => (
                              <span key={idx} className="keyphrase-tag">
                                {phrase.text}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Preview when collapsed */}
                {!isExpanded && (
                  <div className="turn-preview">
                    <div className="preview-user">
                      <strong>User:</strong> {truncateText(turn.userMessage.content, 100)}
                    </div>
                    <div className="preview-assistant">
                      <strong>Assistant:</strong> {truncateText(turn.assistantMessage.content, 150)}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Conversation Stats */}
      {turns.length > 0 && (
        <div className="conversation-stats">
          <div className="stat-item">
            <span className="stat-label">Total Turns:</span>
            <span className="stat-value">{turns.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Messages:</span>
            <span className="stat-value">{conversation.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationView;
