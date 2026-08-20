import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Form, Modal } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import QueueStatsBar from '../../components/QueueStatsBar';
import { 
  FaDesktop, 
  FaUserCheck, 
  FaCheckCircle, 
  FaArrowLeft, 
  FaPlay, 
  FaStop, 
  FaPowerOff, 
  FaExclamationTriangle,
  FaClock
} from 'react-icons/fa';

const AdminQueueManagement = () => {
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
  const [selectedCounterId, setSelectedCounterId] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchOfficeState = async () => {
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

      // Auto select first active counter if none chosen
      if (!selectedCounterId && countRes.data.length > 0) {
        const firstActive = countRes.data.find(c => c.status === 'active');
        if (firstActive) setSelectedCounterId(firstActive._id);
      }
    } catch (err) {
      console.error('Error fetching desk data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficeState();
    const interval = setInterval(fetchOfficeState, 3000); // 3s polling for desk
    return () => clearInterval(interval);
  }, [officeId]);

  const handleStartService = async (tokenId) => {
    if (!selectedCounterId) {
      return alert('Please select an active counter first!');
    }
    setActionLoading(true);
    setError('');
    try {
      await api.put(`/queue/token/${tokenId}/start-service`, {
        counterId: selectedCounterId
      });
      setSuccessMsg('Token called to counter successfully!');
      fetchOfficeState();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start service.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteService = async (tokenId) => {
    setActionLoading(true);
    setError('');
    try {
      const res = await api.put(`/queue/token/${tokenId}/complete`);
      setSuccessMsg(`Service completed! Actual Wait: ${res.data.token.actualWaitingTime} mins. Data logged for ML retraining.`);
      fetchOfficeState();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete service.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCounterStatus = async (counter) => {
    const newStatus = counter.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/counters/${counter._id}/status`, { status: newStatus });
      fetchOfficeState();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update counter status');
    }
  };

  if (loading && !office) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Loading Counter Desk...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <Link to="/admin" className="btn btn-sm btn-link text-decoration-none p-0 text-muted mb-1 d-inline-block">
            <FaArrowLeft className="me-1" /> Back to Overview
          </Link>
          <h2 className="fw-extrabold mb-0">{office?.name} - Desk Management</h2>
        </div>
        <div>
          <Link to={`/queue/${officeId}`} target="_blank" className="btn btn-outline-info btn-sm fw-semibold">
            Open Public Display ↗
          </Link>
        </div>
      </div>

      {successMsg && <Alert variant="success" onClose={() => setSuccessMsg('')} dismissible>{successMsg}</Alert>}
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      <QueueStatsBar 
        waitingCount={liveData.waitingCount}
        servingCount={liveData.servingCount}
        completedCount={liveData.completedCount}
        activeCounters={liveData.activeCounters}
      />

      <Row className="g-4">
        {/* Left: Desk Operations & Counter Controls */}
        <Col lg={7}>
          {/* Active Counter Operator Selector */}
          <Card className="border-0 shadow-sm p-3 mb-4 bg-primary-subtle border-primary">
            <Card.Body>
              <h5 className="fw-bold mb-2 text-primary">Your Operational Counter</h5>
              <p className="small text-muted mb-3">Select the counter you are currently operating to call tokens:</p>
              
              <div className="d-flex flex-wrap gap-2">
                {counters.filter(c => c.status === 'active').map(c => (
                  <Button
                    key={c._id}
                    variant={selectedCounterId === c._id ? 'primary' : 'outline-primary'}
                    className="fw-bold px-3 py-2"
                    onClick={() => setSelectedCounterId(c._id)}
                  >
                    Counter #{c.counterNumber}
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Currently Serving Tokens */}
          <Card className="border-0 shadow-sm p-3 mb-4">
            <Card.Body>
              <h5 className="fw-bold mb-3">
                <FaUserCheck className="me-2 text-success" /> Tokens In Service ({liveData.serving.length})
              </h5>

              {liveData.serving.length > 0 ? (
                <div className="serving-tokens-list">
                  {liveData.serving.map(token => (
                    <div key={token._id} className="p-3 mb-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fs-4 fw-bold font-monospace text-success">{token.tokenNumber}</span>
                          <Badge bg="success">Counter #{token.counter?.counterNumber || 'N/A'}</Badge>
                        </div>
                        <div className="fw-medium text-dark">{token.citizen?.name || 'Citizen'}</div>
                        <div className="small text-muted">{token.service?.name}</div>
                      </div>

                      <div>
                        <Button 
                          variant="success" 
                          className="fw-bold px-3 py-2 d-flex align-items-center gap-1"
                          onClick={() => handleCompleteService(token._id)}
                          disabled={actionLoading}
                        >
                          <FaCheckCircle /> Complete Service
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted p-4 text-center bg-light rounded-3">
                  No citizen currently at the counter. Call next token below.
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Counter Allocation & Toggle Panel */}
          <Card className="border-0 shadow-sm p-3">
            <Card.Body>
              <h5 className="fw-bold mb-2">
                <FaDesktop className="me-2 text-primary" /> Physical Counter Control Panel
              </h5>
              <p className="small text-muted mb-3">Activate or deactivate counters based on crowd recommendations:</p>

              <Row className="g-2">
                {counters.map(counter => (
                  <Col sm={6} key={counter._id}>
                    <div className="p-2 border rounded-3 d-flex justify-content-between align-items-center">
                      <div>
                        <span className="fw-bold">Counter #{counter.counterNumber}</span>
                        <div className="extra-small text-muted">
                          {counter.status === 'active' ? '🟢 Online' : '🔴 Closed'}
                        </div>
                      </div>
                      <Button 
                        variant={counter.status === 'active' ? 'outline-danger' : 'outline-success'}
                        size="sm"
                        onClick={() => handleToggleCounterStatus(counter)}
                      >
                        {counter.status === 'active' ? 'Close' : 'Open'}
                      </Button>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Right: Waiting Queue with "Call Next" */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm p-3 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">
                  Waiting Queue ({liveData.waiting.length})
                </h5>
                <span className="small text-muted">FIFO order</span>
              </div>

              {liveData.waiting.length > 0 ? (
                <div className="waiting-admin-list overflow-auto" style={{ maxHeight: '600px' }}>
                  {liveData.waiting.map((token, idx) => (
                    <div key={token._id} className="p-3 mb-2 bg-light rounded-3 border">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-secondary">#{idx + 1}</span>
                            <span className="fs-5 fw-bold font-monospace text-dark">{token.tokenNumber}</span>
                          </div>
                          <div className="fw-medium text-dark">{token.citizen?.name || 'Citizen'}</div>
                          <div className="extra-small text-muted">{token.service?.name}</div>
                        </div>

                        {idx === 0 && (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="fw-bold btn-glow"
                            onClick={() => handleStartService(token._id)}
                            disabled={actionLoading}
                          >
                            <FaPlay size={10} className="me-1" /> Call Next
                          </Button>
                        )}
                      </div>

                      <div className="small text-muted d-flex justify-content-between border-top pt-2 mt-2">
                        <span>Arrived: {new Date(token.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-warning fw-semibold">Est. {Math.round((idx + 1) * 15)}m</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5 text-muted">
                  <FaCheckCircle size={36} className="text-success mb-2" />
                  <p className="mb-0 fw-medium">All waiting tokens cleared!</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminQueueManagement;
