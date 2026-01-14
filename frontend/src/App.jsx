import { useState } from 'react';
import StudentDashboard from './pages/StudentDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import './App.css';

/**
 * Main App Component
 * Routes between Student and Admin dashboards
 */
function App() {
  const [dashboard, setDashboard] = useState('student'); // 'student' or 'admin'

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">🎓 Smart Queue System</h1>
            <p className="app-subtitle">College Service Management</p>
          </div>
          <nav className="header-nav">
            <button
              className={`nav-btn ${dashboard === 'student' ? 'active' : ''}`}
              onClick={() => setDashboard('student')}
            >
              👨‍🎓 Student Portal
            </button>
            <button
              className={`nav-btn ${dashboard === 'admin' ? 'active' : ''}`}
              onClick={() => setDashboard('admin')}
            >
              👨‍💼 Admin Panel
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {dashboard === 'student' && <StudentDashboard />}
        {dashboard === 'admin' && <AdminDashboard />}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2026 Smart Queue System | Hackathon Ready</p>
      </footer>
    </div>
  );
}

export default App;

