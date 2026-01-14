import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './AdminDashboard.css';

const API_BASE = 'http://localhost:5000';
const socket = io(API_BASE);

/**
 * Admin Dashboard Component
 * Allows admins to:
 * - View all tokens and their status
 * - Call next token for a service
 * - Mark tokens as completed
 * - Monitor real-time queue activity
 */
function AdminDashboard() {
  const [services, setServices] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [currentServing, setCurrentServing] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [queueData, setQueueData] = useState(null);

  // Fetch services on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/services`);
        setServices(res.data);
        if (res.data.length > 0) {
          setSelectedServiceId(res.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchData();
  }, []);

  // Setup Socket.io listeners for real-time updates
  useEffect(() => {
    socket.on('queueUpdate', (data) => {
      setTokens(data.tokens || []);
      setCurrentServing(data.currentServing);
      setQueueData(data);
    });

    return () => {
      socket.off('queueUpdate');
    };
  }, []);

  /**
   * Call the next token for a specific service
   */
  const handleCallNext = async (serviceId) => {
    setLoading(true);
    try {
      const res = await axios.put(`${API_BASE}/api/tokens/next`, {
        serviceId,
      });
      console.log('Next token called:', res.data.token);
    } catch (error) {
      console.error('Error calling next token:', error);
      alert('Error: ' + (error.response?.data?.error || 'Failed to call next token'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark a token as completed
   */
  const handleCompleteToken = async (tokenId) => {
    if (!window.confirm(`Mark token #${tokenId} as completed?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(`${API_BASE}/api/tokens/complete`, {
        tokenId,
      });
      console.log('Token completed:', res.data.token);
    } catch (error) {
      console.error('Error completing token:', error);
      alert('Error: ' + (error.response?.data?.error || 'Failed to complete token'));
    } finally {
      setLoading(false);
    }
  };

  // Get queue for selected service
  const selectedService = services.find((s) => s.id === selectedServiceId);
  const selectedQueue = queueData?.queues?.find(
    (q) => q.serviceId === selectedServiceId
  );
  const serviceTokens = tokens.filter(
    (t) => t.serviceId === selectedServiceId && t.status !== 'completed'
  );

  return (
    <div className="admin-dashboard">
      {/* Admin Header */}
      <section className="admin-header">
        <h2>👨‍💼 Admin Control Panel</h2>
        <p>Manage campus service queues in real-time</p>
      </section>

      <div className="admin-content">
        {/* Left Column - Service Selection & Control */}
        <div className="left-column">
          <div className="card service-control-card">
            <h3>🎛️ Service Management</h3>

            {services.length > 0 ? (
              <>
                <div className="service-selector">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      className={`service-btn ${
                        selectedServiceId === service.id ? 'active' : ''
                      }`}
                      onClick={() => setSelectedServiceId(service.id)}
                      disabled={loading}
                    >
                      <span>{service.name}</span>
                      <span className="counter-badge">
                        {
                          queueData?.queues?.find((q) => q.serviceId === service.id)
                            ?.queueCount || 0
                        }
                      </span>
                    </button>
                  ))}
                </div>

                {selectedService && (
                  <div className="service-actions">
                    <div className="action-info">
                      <p className="service-name-display">{selectedService.name}</p>
                      <p className="counter-location">{selectedService.counter}</p>
                    </div>

                    <button
                      className="btn btn-call-next"
                      onClick={() => handleCallNext(selectedServiceId)}
                      disabled={loading || (selectedQueue?.queueCount || 0) === 0}
                    >
                      {loading ? '⏳ Processing...' : '📞 Call Next Token'}
                    </button>

                    {(selectedQueue?.queueCount || 0) === 0 && (
                      <p className="no-tokens-message">No tokens in queue</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="loading-text">Loading services...</p>
            )}
          </div>
        </div>

        {/* Right Column - Queue Status & Tokens */}
        <div className="right-column">
          {/* Current Status Card */}
          <div className="card status-card">
            <h3>📊 Current Status</h3>
            <div className="status-info">
              <div className="status-item">
                <span className="status-label">Service:</span>
                <span className="status-value">
                  {selectedService?.name || '---'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Queue Count:</span>
                <span className="status-value queue-badge">
                  {selectedQueue?.queueCount || 0}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Now Serving:</span>
                <span className="status-value serving-badge">
                  {currentServing?.id ? `#${currentServing.id}` : 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Active Queue */}
          <div className="card queue-card">
            <h3>📋 Active Queue</h3>
            {serviceTokens.length > 0 ? (
              <div className="queue-list">
                {serviceTokens.map((token, index) => (
                  <div
                    key={token.id}
                    className={`queue-item ${token.status}`}
                    data-status={token.status}
                  >
                    <div className="queue-item-left">
                      <div className="queue-number">#{token.id}</div>
                      <div className="queue-details">
                        <p className="student-name">{token.studentName}</p>
                        <p className="student-id">{token.studentId}</p>
                      </div>
                    </div>

                    <div className="queue-item-middle">
                      <span className={`status-badge ${token.status}`}>
                        {token.status === 'waiting' && '⏳ Waiting'}
                        {token.status === 'serving' && '✅ Serving'}
                        {token.status === 'completed' && '✓ Completed'}
                      </span>
                    </div>

                    <div className="queue-item-actions">
                      {token.status === 'serving' && (
                        <button
                          className="btn btn-complete"
                          onClick={() => handleCompleteToken(token.id)}
                          disabled={loading}
                        >
                          {loading ? '...' : '✓ Complete'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-queue">No active tokens in queue</p>
            )}
          </div>

          {/* Now Serving Display */}
          {currentServing && (
            <div className="card now-serving-card">
              <h3>🎤 Now Serving</h3>
              <div className="serving-display-admin">
                <div className="serving-token-number">#{currentServing.id}</div>
                <div className="serving-details">
                  <p className="serving-name">{currentServing.studentName}</p>
                  <p className="serving-service">{currentServing.serviceName}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;