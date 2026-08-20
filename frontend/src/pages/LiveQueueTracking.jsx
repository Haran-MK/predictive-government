import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Table } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import QueueStatsBar from '../components/QueueStatsBar';
import { 
  FaBrain, 
  FaDesktop, 
  FaUserClock, 
  FaCheckCircle, 
  FaArrowLeft,
  FaBuilding,
  FaClock,
  FaSignal
} from 'react-icons/fa';

const LiveQueueTracking = () => {
  const { officeId } = useParams();
  const [office, setOffice] = useState(null);
  const [liveData, setLiveData] = useState({
    waiting: [],
    serving: [],
    waitingCount: 0,
    servingCount: 0,
    completedCount: 0,
    activeCounters: 0
  });
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLiveStatus = async () => {
    try {
      if (!office) {
        const offRes = await api.get(`/offices/${officeId}`);
        setOffice(offRes.data);
      }

      const [liveRes, countRes] = await Promise.all([
        api.get(`/queue/office/${officeId}/live`),
        api.get(`/counters/office/${officeId}`)
      ]);

      setLiveData(liveRes.data);
      setCounters(countRes.data);
    } catch (err) {
      console.error('Error fetching live queue:', err);
      setError('Could not update live queue status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 4000); // 4s live polling
    return () => clearInterval(interval);
  }, [officeId]);

  if (loading && !office) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Connecting to Live Queue Intelligence...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Badge bg="danger" className="pulse-animation d-flex align-items-center gap-1">
              <FaSignal size={10} /> LIVE RADAR
            </Badge>
            <span className="text-muted small">Auto-refreshing every 4s</span>
          </div>
          <h2 className="fw-extrabold mb-0">{office?.name || 'Government Office'}</h2>
          <p className="text-muted mb-0">
            <FaBuilding className="me-1 text-primary" /> {office?.address}, {office?.city}
          </p>
        </div>

        <div className="mt-3 mt-md-0">
          <Link to="/book" className="btn btn-primary fw-bold shadow-sm">
            Book Token for this Office 🎟️
          </Link>
        </div>
      </div>

      {error && <Alert variant="warning">{error}</Alert>}

      {/* Operational Stats Bar */}
      <QueueStatsBar 
        waitingCount={liveData.waitingCount}
        servingCount={liveData.servingCount}
        completedCount={liveData.completedCount}
        activeCounters={liveData.activeCounters}
      />

      <Row className="g-4">
        {/* Active Counters Grid */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm p-3 mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">
                  <FaDesktop className="me-2 text-primary" /> Counter Status & Serving Tokens
                </h5>
                <Badge bg="primary-subtle" className="text-primary border">
                  {counters.length} Total Counters
                </Badge>
              </div>

              <Row className="g-3">
                {counters.map(counter => {
                  const isCounterActive = counter.status === 'active';
                  const activeServingToken = counter.currentToken;

                  return (
                    <Col sm={6} key={counter._id}>
                      <div className={`counter-box p-3 rounded-3 border h-100 ${isCounterActive ? 'bg-white' : 'bg-light opacity-50'}`}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-bold text-dark fs-5">Counter #{counter.counterNumber}</span>
                          <Badge bg={isCounterActive ? (activeServingToken ? 'success' : 'info') : 'secondary'}>
                            {!isCounterActive ? 'Closed' : activeServingToken ? 'Serving' : 'Available'}
                          </Badge>
                        </div>

                        {activeServingToken ? (
                          <div className="current-token-display p-2 bg-success-subtle rounded text-center">
                            <span className="extra-small text-muted text-uppercase d-block">Token</span>
                            <span className="fs-3 fw-bold text-success font-monospace">
                              {activeServingToken.tokenNumber || 'In Service'}
                            </span>
                          </div>
                        ) : (
                          <div className="p-2 bg-light rounded text-center text-muted small">
                            {isCounterActive ? 'Ready for next token' : 'Counter Offline'}
                          </div>
                        )}
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </Card.Body>
          </Card>

          {/* AI Crowd Prediction Box */}
          <Card className="border-0 shadow-sm p-3 bg-gradient-dark text-white">
            <Card.Body>
              <div className="d-flex align-items-center gap-2 mb-2">
                <FaBrain className="text-warning fs-4" />
                <h5 className="fw-bold mb-0">AI Crowd & Resource Recommendation</h5>
              </div>
              <p className="small opacity-75 mb-3">
                Based on current queue density ({liveData.waitingCount} waiting) and counter velocity:
              </p>
              <div className="p-3 rounded-3 bg-white bg-opacity-10 border border-light border-opacity-25">
                {liveData.waitingCount > 8 ? (
                  <div className="text-warning fw-semibold">
                    ⚠️ High crowd congestion detected! System recommends opening 1 additional counter to maintain average wait under 20 mins.
                  </div>
                ) : (
                  <div className="text-success fw-semibold">
                    ✅ Optimal queue throughput. Citizen wait times are within expected parameters.
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Live Waiting Queue List */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm p-3 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">
                  <FaUserClock className="me-2 text-warning" /> Waiting Queue ({liveData.waiting.length})
                </h5>
                <span className="small text-muted">Arrival order</span>
              </div>

              {liveData.waiting.length > 0 ? (
                <div className="waiting-queue-list overflow-auto" style={{ maxHeight: '480px' }}>
                  {liveData.waiting.map((token, idx) => (
                    <div key={token._id} className="p-2 mb-2 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-3">
                        <span className="queue-rank-badge badge bg-secondary rounded-circle px-2 py-1">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="fw-bold text-dark font-monospace">{token.tokenNumber}</div>
                          <div className="extra-small text-muted">{token.service?.name}</div>
                        </div>
                      </div>
                      <div className="text-end">
                        <span className="small fw-semibold text-warning">
                          <FaClock className="me-1" /> ~{(idx + 1) * 15}m
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5 text-muted">
                  <FaCheckCircle size={36} className="text-success mb-2" />
                  <p className="mb-0 fw-medium">No citizens currently waiting.</p>
                  <span className="small">Queue is completely clear!</span>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LiveQueueTracking;
