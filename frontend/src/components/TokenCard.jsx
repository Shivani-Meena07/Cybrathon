import './TokenCard.css';

/**
 * TokenCard Component
 * Displays token information including:
 * - Token number
 * - Status (waiting, serving, completed)
 * - Position in queue
 * - Current serving token
 */
function TokenCard({ token, position, currentServing }) {
  if (!token) {
    return null;
  }

  // Determine status color and emoji
  const getStatusInfo = (status) => {
    switch (status) {
      case 'waiting':
        return { color: '#f59e0b', emoji: '⏳', text: 'Waiting' };
      case 'serving':
        return { color: '#22c55e', emoji: '✅', text: 'Being Served' };
      case 'completed':
        return { color: '#9ca3af', emoji: '✓', text: 'Completed' };
      default:
        return { color: '#6b7280', emoji: '?', text: 'Unknown' };
    }
  };

  const statusInfo = getStatusInfo(token.status);
  const isServing = token.status === 'serving';
  const isCompleted = token.status === 'completed';

  return (
    <div className={`token-card ${token.status}`}>
      <div className="token-card-header">
        <h3>🎫 Your Token</h3>
        <div className={`status-badge ${token.status}`}>
          <span className="status-emoji">{statusInfo.emoji}</span>
          <span className="status-text">{statusInfo.text}</span>
        </div>
      </div>

      <div className="token-content">
        {/* Token Number - Large Display */}
        <div className="token-number-section">
          <div className="token-number">#{token.id}</div>
          <p className="token-service">{token.serviceName}</p>
        </div>

        {/* Token Details */}
        <div className="token-details">
          <div className="detail-row">
            <span className="detail-label">Student:</span>
            <span className="detail-value">{token.studentName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">ID:</span>
            <span className="detail-value">{token.studentId}</span>
          </div>

          {!isCompleted && typeof position === 'number' && (
            <div className="detail-row position-row">
              <span className="detail-label">Position:</span>
              <span className="detail-value">
                {position === 0 ? (
                  <span className="position-next">NEXT! 🎉</span>
                ) : (
                  <span className="position-count">{position + 1} ahead</span>
                )}
              </span>
            </div>
          )}

          {currentServing && (
            <div className="detail-row serving-info">
              <span className="detail-label">Now Serving:</span>
              <span className="detail-value">#{currentServing.id}</span>
            </div>
          )}

          {isCompleted && <div className="completed-message">✅ Service Completed</div>}
        </div>
      </div>

      {isServing && (
        <div className="serving-alert">
          <span className="alert-icon">📢</span>
          <span className="alert-text">You're being served! Proceed to the counter.</span>
        </div>
      )}
    </div>
  );
}

export default TokenCard;
