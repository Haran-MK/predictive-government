import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TokenCard from '../components/TokenCard';
import { 
  FaTicketAlt, 
  FaPlusCircle, 
  FaHistory, 
  FaClock, 
  FaBuilding, 
  FaExclamationCircle,
  FaCheckCircle
} from 'react-icons/fa';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyTokens = async () => {
    try {
      const res = await api.get('/queue/my-tokens');
      setTokens(res.data);
    } catch (err) {
      setError('Could not load your tokens. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTokens();
    const interval = setInterval(fetchMyTokens, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const handleCancelToken = async (tokenId) => {
    if (!window.confirm('Are you sure you want to cancel this token?')) return;
    try {
      await api.put(`/queue/token/${tokenId}/cancel`);
      fetchMyTokens();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel token');
    }
  };

  // Find active token (waiting or serving)
  const activeTokens = tokens.filter(t => t.status === 'waiting' || t.status === 'serving');
  const pastTokens = tokens.filter(t => t.status === 'completed' || t.status === 'cancelled');

  return (
    <Container className="py-4">
      {/* Header Banner */}
      <div className="welcome-banner p-4 rounded-4 text-white mb-4 shadow-sm bg-gradient-primary">
        <Row className="align-items-center">
          <Col md={8}>
            <h2 className="fw-bold mb-1">Vanakkam, {user?.name || 'Citizen'}! 🙏</h2>
            <p className="mb-0 opacity-90">
              Welcome to your TN Smart Queue Dashboard. Track active tokens, predict wait times, and manage bookings.
            </p>
          </Col>
          <Col md={4} className="text-md-end mt-3 mt-md-0">
            <Link to="/book" className="btn btn-warning fw-bold px-3 py-2 text-dark shadow-sm">
              <FaPlusCircle className="me-1" /> Book New Token
            </Link>
          </Col>
        </Row>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading your tokens...</p>
        </div>
      ) : (
        <Row className="g-4">
          {/* Active Token Section */}
          <Col lg={7}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold mb-0">
                <FaTicketAlt className="me-2 text-primary" /> Active Digital Token
              </h4>
              {activeTokens.length > 0 && (
                <Badge bg="success" className="pulse-animation">Live</Badge>
              )}
            </div>

            {activeTokens.length > 0 ? (
              activeTokens.map(token => (
                <TokenCard key={token._id} token={token} onCancel={handleCancelToken} />
              ))
            ) : (
              <Card className="border-0 shadow-sm p-4 text-center bg-light">
                <Card.Body>
                  <div className="empty-state-icon text-muted mb-3">
                    <FaTicketAlt size={40} />
                  </div>
                  <h5 className="fw-bold">No Active Queue Token</h5>
                  <p className="text-muted">You do not currently have any active appointments in queue.</p>
                  <Link to="/book" className="btn btn-primary btn-sm fw-semibold">
                    <FaPlusCircle className="me-1" /> Get a Token Now
                  </Link>
                </Card.Body>
              </Card>
            )}

            {/* AI Estimation Info Note */}
            <Card className="border-0 bg-info-subtle mt-4 p-3 shadow-none">
              <div className="d-flex gap-3">
                <FaExclamationCircle className="text-info fs-3 flex-shrink-0" />
                <div>
                  <h6 className="fw-bold text-info-emphasis mb-1">AI Smart Reminder</h6>
                  <p className="small text-muted mb-0">
                    Our machine learning model updates your wait time continuously as counters complete previous tokens. You will receive an SMS when you are within 2 positions of the counter.
                  </p>
                </div>
              </div>
            </Card>
          </Col>

          {/* Past History Section */}
          <Col lg={5}>
            <h4 className="fw-bold mb-3">
              <FaHistory className="me-2 text-secondary" /> Recent History
            </h4>

            {pastTokens.length > 0 ? (
              <div className="history-list">
                {pastTokens.slice(0, 5).map(token => (
                  <Card key={token._id} className="border-0 shadow-sm mb-2 p-2">
                    <Card.Body className="p-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-bold text-dark font-monospace">{token.tokenNumber} - {token.service?.name}</div>
                          <div className="small text-muted">{token.office?.name} • {token.date}</div>
                        </div>
                        <div>
                          <Badge bg={token.status === 'completed' ? 'success' : 'danger'}>
                            {token.status}
                          </Badge>
                        </div>
                      </div>
                      {token.actualWaitingTime && (
                        <div className="small text-muted mt-1">
                          <FaClock className="me-1" /> Waited: {token.actualWaitingTime} mins
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted small">No past appointments recorded.</p>
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default CitizenDashboard;
