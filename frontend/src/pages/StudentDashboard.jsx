import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import ServiceCard from '../components/ServiceCard.jsx';
import TokenCard from '../components/TokenCard.jsx';
import './StudentDashboard.css';

const API_BASE = 'http://localhost:5000';
const socket = io(API_BASE);

/**
 * Student Dashboard Component
 * Allows students to:
 * - View available services
 * - Generate tokens
 * - Track token status in real-time
 * - See queue position and now serving token
 */
function StudentDashboard() {
  const [services, setServices] = useState([]);
  const [myToken, setMyToken] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentServing, setCurrentServing] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [tokenPosition, setTokenPosition] = useState(null);

  // Fetch services on component mount
  useEffect(() => {
    const fetchServices = async () => {
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

    fetchServices();
  }, []);

  // Setup Socket.io listeners for real-time updates
  useEffect(() => {
    // Listen for queue updates
    socket.on('queueUpdate', (data) => {
      setQueueData(data);
      setCurrentServing(data.currentServing);

      // Update token position if this is our token
      if (myToken) {
        const updatedToken = data.tokens.find((t) => t.id === myToken.id);
        if (updatedToken) {
          setMyToken(updatedToken);
          const queue = data.tokens.filter(
            (t) => t.serviceId === updatedToken.serviceId && t.status !== 'completed'
          );
          const position = queue.findIndex((t) => t.id === updatedToken.id);
          setTokenPosition(position !== -1 ? position : null);
        }
      }
    });

    return () => {
      socket.off('queueUpdate');
    };
  }, [myToken]);

  /**
   * Generate a new token for the selected service
   */
  const handleGenerateToken = async () => {
    if (!studentName.trim() || !studentId.trim() || !selectedServiceId) {
      alert('Please fill in all fields and select a service');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/tokens/generate`, {
        serviceId: selectedServiceId,
        studentName: studentName.trim(),
        studentId: studentId.trim(),
      });

      if (res.data.success) {
        setMyToken(res.data.token);
        setTokenPosition(res.data.position);
      }
    } catch (error) {
      console.error('Error generating token:', error);
      alert('Failed to generate token. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get queue count for selected service
  const selectedQueue = queueData?.queues?.find(
    (q) => q.serviceId === selectedServiceId
  );

  return (
    <div className="student-dashboard">
      {/* Hero Section */}
      <section className="hero-section">
        <h2>📱 Welcome to the Smart Queue System</h2>
        <p>No more long queues. Track your service status in real-time.</p>
      </section>

      <div className="dashboard-content">
        {/* Left Column - Token Generation */}
        <div className="left-column">
          <div className="card generate-card">
            <h3>🎫 Generate Your Token</h3>

            {!myToken ? (
              <form className="token-form">
                <div className="form-group">
                  <label htmlFor="studentName">Student Name</label>
                  <input
                    id="studentName"
                    type="text"
                    placeholder="Enter your name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="studentId">Student ID</label>
                  <input
                    id="studentId"
                    type="text"
                    placeholder="e.g., CSE001"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Select Service</label>
                  <div className="services-list">
                    {services.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        isSelected={selectedServiceId === service.id}
                        onSelect={() => setSelectedServiceId(service.id)}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGenerateToken}
                  disabled={loading}
                >
                  {loading ? 'Generating...' : '✨ Generate Token'}
                </button>
              </form>
            ) : (
              <div className="token-generated-message">
                <p className="success-text">✅ Token Generated Successfully!</p>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setMyToken(null);
                    setStudentName('');
                    setStudentId('');
                    setTokenPosition(null);
                  }}
                >
                  Generate Another Token
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Status & Queue Info */}
        <div className="right-column">
          {/* Current Token Status */}
          {myToken && (
            <TokenCard
              token={myToken}
              position={tokenPosition}
              currentServing={currentServing}
            />
          )}

          {/* Queue Information */}
          <div className="card queue-info-card">
            <h3>📊 Queue Information</h3>
            {selectedQueue ? (
              <div className="queue-stats">
                <div className="stat-item">
                  <span className="stat-label">Service:</span>
                  <span className="stat-value">{selectedQueue.serviceName}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">People in Queue:</span>
                  <span className="stat-value queue-count">
                    {selectedQueue.queueCount}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Now Serving:</span>
                  <span className="stat-value serving-token">
                    {currentServing?.id || '---'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="no-data">Select a service to view queue info</p>
            )}
          </div>

          {/* Now Serving Card */}
          {currentServing && (
            <div className="card now-serving-card">
              <h3>🎤 Now Serving</h3>
              <div className="serving-display">
                <div className="serving-number">Token #{currentServing.id}</div>
                <div className="serving-student">{currentServing.studentName}</div>
                <div className="serving-service">{currentServing.serviceName}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
