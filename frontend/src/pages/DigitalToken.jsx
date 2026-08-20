import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  FaTicketAlt, 
  FaClock, 
  FaBuilding, 
  FaQrcode, 
  FaCheckCircle, 
  FaHourglassHalf, 
  FaShareAlt, 
  FaTimesCircle,
  FaArrowLeft,
  FaRobot,
  FaDesktop
} from 'react-icons/fa';

const DigitalToken = () => {
  const { id } = useParams();
  const [token, setToken] = useState(null);
  const [positionData, setPositionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchTokenDetails = async () => {
    try {
      // Fetch user's tokens to find this one
      const res = await api.get('/queue/my-tokens');
      const found = res.data.find(t => t._id === id);
      if (found) {
        setToken(found);
      } else {
        setError('Token not found.');
      }

      // Fetch live position details
      const posRes = await api.get(`/queue/position/${id}`);
      setPositionData(posRes.data);
    } catch (err) {
      console.error('Error fetching token details:', err);
      setError('Could not refresh live position.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenDetails();
    const interval = setInterval(fetchTokenDetails, 5000); // 5s live polling
    return () => clearInterval(interval);
  }, [id]);

  const handleCancelToken = async () => {
    if (!window.confirm('Are you sure you want to cancel this token?')) return;
    try {
      await api.put(`/queue/token/${id}/cancel`);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel token');
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Retrieving your digital token...</p>
      </Container>
    );
  }

  if (error || !token) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || 'Token not found'}</Alert>
        <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
      </Container>
    );
  }

  const isServing = token.status === 'serving';
  const isCompleted = token.status === 'completed';
  const isCancelled = token.status === 'cancelled';

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          {/* Back button */}
          <div className="mb-3">
            <Link to="/dashboard" className="btn btn-sm btn-link text-decoration-none p-0 text-muted">
              <FaArrowLeft className="me-1" /> Back to Dashboard
            </Link>
          </div>

          {/* Smart Token Ticket Card */}
          <div className="digital-ticket-wrapper shadow-lg rounded-4 overflow-hidden bg-white border">
            {/* Header / Brand */}
            <div className={`ticket-header p-4 text-white text-center ${isServing ? 'bg-success' : isCompleted ? 'bg-secondary' : 'bg-gradient-primary'}`}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small text-uppercase tracking-wider opacity-75">TN Smart Queue Pass</span>
                <Badge bg={isServing ? "warning" : isCompleted ? "dark" : "info"} text={isServing ? "dark" : "white"}>
                  {token.status.toUpperCase()}
                </Badge>
              </div>

              {/* Massive Token Number Display */}
              <div className="token-number-hero my-2">
                <h1 className="display-1 fw-extrabold text-white font-monospace tracking-wide mb-0">
                  {token.tokenNumber}
                </h1>
              </div>
              <p className="mb-0 opacity-90 small">
                {token.office?.name} ({token.office?.city})
              </p>
            </div>

            {/* Ticket Tear Effect Line */}
            <div className="ticket-tear-line"></div>

            {/* Ticket Details Body */}
            <div className="p-4">
              {/* Counter / Serving Callout */}
              {isServing && (
                <div className="alert alert-success d-flex align-items-center gap-3 p-3 mb-4 rounded-3 border-0">
                  <FaDesktop size={28} className="text-success flex-shrink-0" />
                  <div>
                    <h5 className="fw-bold mb-0">Now Serving at Counter!</h5>
                    <p className="small mb-0">Please proceed immediately to <strong>Counter #{token.counter?.counterNumber || 1}</strong></p>
                  </div>
                </div>
              )}

              {/* Queue Position & AI Wait Grid */}
              {!isCompleted && !isCancelled && (
                <Row className="g-3 mb-4">
                  <Col xs={6}>
                    <div className="p-3 bg-light rounded-3 text-center border">
                      <div className="small text-muted mb-1">Queue Position</div>
                      <div className="fs-2 fw-extrabold text-primary font-monospace">
                        {isServing ? '0' : `#${positionData?.position || 1}`}
                      </div>
                      <div className="small text-muted">
                        {isServing ? 'At Counter' : 'People ahead'}
                      </div>
                    </div>
                  </Col>

                  <Col xs={6}>
                    <div className="p-3 bg-light rounded-3 text-center border">
                      <div className="small text-muted mb-1 d-flex align-items-center justify-content-center gap-1">
                        <FaRobot className="text-warning" /> AI Expected Wait
                      </div>
                      <div className="fs-2 fw-extrabold text-warning font-monospace">
                        {positionData?.predictedWaitingTime 
                          ? `${positionData.predictedWaitingTime}m` 
                          : `${positionData?.estimatedWaitMinutes || 15}m`}
                      </div>
                      <div className="small text-muted">Minutes remaining</div>
                    </div>
                  </Col>
                </Row>
              )}

              {/* Service Info Details */}
              <div className="service-details-list border-top pt-3">
                <div className="d-flex justify-content-between py-2 border-bottom small">
                  <span className="text-muted">Service Type:</span>
                  <span className="fw-bold text-dark">{token.service?.name}</span>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom small">
                  <span className="text-muted">Issued At:</span>
                  <span className="fw-medium text-dark">{new Date(token.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom small">
                  <span className="text-muted">Appointment Date:</span>
                  <span className="fw-medium text-dark">{token.date}</span>
                </div>
                {token.actualWaitingTime && (
                  <div className="d-flex justify-content-between py-2 border-bottom small">
                    <span className="text-muted">Actual Waiting Time:</span>
                    <span className="fw-bold text-success">{token.actualWaitingTime} minutes</span>
                  </div>
                )}
              </div>

              {/* QR Code representation */}
              <div className="text-center py-4 my-2 bg-light rounded-3 border">
                <FaQrcode size={100} className="text-dark opacity-75 mb-2" />
                <div className="small text-muted font-monospace">{token._id}</div>
                <div className="extra-small text-muted">Scan at office counter scanner upon arrival</div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-2 pt-2">
                <Link to={`/queue/${token.office?._id || token.office}`} className="btn btn-outline-primary w-100 fw-semibold">
                  Track Full Office Queue
                </Link>
                {!isCompleted && !isCancelled && (
                  <Button variant="outline-danger" className="w-50 fw-semibold" onClick={handleCancelToken}>
                    Cancel Token
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default DigitalToken;
