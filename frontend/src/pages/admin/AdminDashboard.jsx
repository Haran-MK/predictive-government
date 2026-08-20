import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  FaChartLine, 
  FaBuilding, 
  FaBrain, 
  FaUsers, 
  FaClock, 
  FaDesktop, 
  FaArrowRight,
  FaCheckCircle,
  FaSync
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, officesRes] = await Promise.all([
        api.get('/training-data/stats'),
        api.get('/offices')
      ]);
      setStats(statsRes.data);
      setOffices(officesRes.data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Loading Admin Intelligence Portal...</p>
      </Container>
    );
  }

  const { overview = {}, trainingDataStats = {} } = stats || {};

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Badge bg="dark" className="px-3 py-1 mb-2">TN Smart Queue Administrative Console</Badge>
          <h2 className="fw-extrabold mb-0">System Overview & Resource Analytics</h2>
        </div>
        <Button 
          variant="outline-primary" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
          className="d-flex align-items-center gap-1"
        >
          <FaSync className={refreshing ? 'spin-animation' : ''} /> Refresh
        </Button>
      </div>

      {/* Main KPI Counters */}
      <Row className="g-3 mb-4">
        <Col xs={6} lg={3}>
          <Card className="border-0 shadow-sm p-2 bg-light">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted small fw-semibold">Total Completed</div>
                  <div className="fs-3 fw-bold text-success">{overview.totalCompleted || 0}</div>
                </div>
                <div className="bg-success-subtle text-success p-3 rounded-circle">
                  <FaCheckCircle size={22} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} lg={3}>
          <Card className="border-0 shadow-sm p-2 bg-light">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted small fw-semibold">Currently Waiting</div>
                  <div className="fs-3 fw-bold text-warning">{overview.totalWaiting || 0}</div>
                </div>
                <div className="bg-warning-subtle text-warning p-3 rounded-circle">
                  <FaUsers size={22} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} lg={3}>
          <Card className="border-0 shadow-sm p-2 bg-light">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted small fw-semibold">Avg Waiting Time</div>
                  <div className="fs-3 fw-bold text-primary">
                    {Math.round(trainingDataStats.avgWaitingTime || 0)}m
                  </div>
                </div>
                <div className="bg-primary-subtle text-primary p-3 rounded-circle">
                  <FaClock size={22} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} lg={3}>
          <Card className="border-0 shadow-sm p-2 bg-light">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted small fw-semibold">ML Training Records</div>
                  <div className="fs-3 fw-bold text-info">{trainingDataStats.totalRecords || 0}</div>
                </div>
                <div className="bg-info-subtle text-info p-3 rounded-circle">
                  <FaBrain size={22} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Office Queue Management Links */}
      <h4 className="fw-bold mb-3">
        <FaBuilding className="me-2 text-primary" /> Active Government Offices
      </h4>
      <Row className="g-4 mb-4">
        {offices.map((office) => (
          <Col md={6} key={office._id}>
            <Card className="border-0 shadow-sm p-3 h-100 hover-elevate">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="fw-bold text-dark mb-1">{office.name}</h5>
                  <Badge bg="success">Operational</Badge>
                </div>
                <p className="text-muted small mb-3">
                  {office.address}, {office.city} • Counters: {office.totalCounters}
                </p>
                <div className="d-flex gap-2">
                  <Link 
                    to={`/admin/queue/${office._id}`} 
                    className="btn btn-primary btn-sm fw-semibold w-100 d-flex align-items-center justify-content-center gap-1"
                  >
                    <FaDesktop /> Manage Live Desk
                  </Link>
                  <Link 
                    to={`/queue/${office._id}`} 
                    className="btn btn-outline-secondary btn-sm fw-semibold"
                  >
                    Public View
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ML Pipeline & Retraining Diagnostics */}
      <Card className="border-0 shadow-sm p-3 bg-white">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <FaBrain className="text-warning fs-4" />
              <h5 className="fw-bold mb-0">Predictive ML Model Intelligence</h5>
            </div>
            <Badge bg="info" className="p-2">Model V1 (Random Forest)</Badge>
          </div>

          <Row className="g-3 text-center">
            <Col sm={3}>
              <div className="p-3 bg-light rounded-3">
                <span className="small text-muted d-block">Min Wait Logged</span>
                <span className="fw-bold text-success fs-5">{trainingDataStats.minWaitingTime || 0} mins</span>
              </div>
            </Col>
            <Col sm={3}>
              <div className="p-3 bg-light rounded-3">
                <span className="small text-muted d-block">Max Wait Logged</span>
                <span className="fw-bold text-danger fs-5">{trainingDataStats.maxWaitingTime || 0} mins</span>
              </div>
            </Col>
            <Col sm={3}>
              <div className="p-3 bg-light rounded-3">
                <span className="small text-muted d-block">Avg Service Duration</span>
                <span className="fw-bold text-primary fs-5">{Math.round(trainingDataStats.avgServiceDuration || 0)} mins</span>
              </div>
            </Col>
            <Col sm={3}>
              <div className="p-3 bg-light rounded-3">
                <span className="small text-muted d-block">Retrain Trigger</span>
                <span className="fw-bold text-dark fs-5">{trainingDataStats.totalRecords % 100}/100 tokens</span>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminDashboard;
