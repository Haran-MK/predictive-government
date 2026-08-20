import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaBrain, 
  FaTicketAlt, 
  FaClock, 
  FaBuilding, 
  FaChartLine, 
  FaCheckCircle, 
  FaArrowRight, 
  FaMobileAlt,
  FaShieldAlt
} from 'react-icons/fa';
import api from '../services/api';

const LandingPage = () => {
  const [offices, setOffices] = useState([]);

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const res = await api.get('/offices');
        setOffices(res.data);
      } catch (err) {
        console.error('Failed to load offices:', err);
      }
    };
    fetchOffices();
  }, []);

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section py-5">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={7}>
              <div className="hero-badge mb-3">
                <Badge bg="primary" className="px-3 py-2 rounded-pill fs-6 fw-normal">
                  <FaBrain className="me-2 text-warning" /> AI-Powered Queue Intelligence
                </Badge>
              </div>
              <h1 className="hero-title display-4 fw-extrabold mb-3">
                Zero Physical Queues. <br />
                <span className="text-gradient">Predictable Waiting Times.</span>
              </h1>
              <p className="hero-desc lead text-muted mb-4">
                <strong>TN Smart Queue</strong> revolutionizes Tamil Nadu public sector offices with dynamic ML-driven wait time prediction, instant digital tokens, and intelligent counter resource allocation.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/book" className="btn btn-primary btn-lg btn-glow px-4 py-3 fw-bold d-flex align-items-center gap-2">
                  <FaTicketAlt /> Book Digital Token
                </Link>
                <Link to="/login" className="btn btn-outline-dark btn-lg px-4 py-3 fw-semibold">
                  Citizen Login
                </Link>
              </div>

              <div className="mt-4 pt-3 border-top d-flex gap-4 text-muted small">
                <div><FaCheckCircle className="text-success me-1" /> No physical standing in line</div>
                <div><FaCheckCircle className="text-success me-1" /> Live AI wait estimation</div>
                <div><FaCheckCircle className="text-success me-1" /> Instant SMS & digital alerts</div>
              </div>
            </Col>

            <Col lg={5}>
              <div className="hero-visual-card shadow-lg p-4 rounded-4 bg-white border">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-danger rounded-circle p-2"> </span>
                    <span className="fw-bold text-dark">Live Office Queues</span>
                  </div>
                  <span className="badge bg-light text-primary border">Real-time Feed</span>
                </div>

                <div className="office-quick-list">
                  {offices.map((office) => (
                    <div key={office._id} className="p-3 mb-2 rounded-3 bg-light border d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold text-dark">{office.name}</div>
                        <div className="small text-muted">{office.city} • Open {office.operatingHours?.open} - {office.operatingHours?.close}</div>
                      </div>
                      <Link to={`/queue/${office._id}`} className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1">
                        Track <FaArrowRight size={12} />
                      </Link>
                    </div>
                  ))}
                  {offices.length === 0 && (
                    <p className="text-muted text-center my-3">Loading offices...</p>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Feature Highlights */}
      <section className="py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold">How TN Smart Queue Works</h2>
            <p className="text-muted">A closed-loop AI system designed for maximum public sector efficiency</p>
          </div>

          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm p-3">
                <Card.Body>
                  <div className="feature-icon bg-primary text-white mb-3">
                    <FaTicketAlt size={24} />
                  </div>
                  <h4 className="fw-bold">1. Digital Token Booking</h4>
                  <p className="text-muted">
                    Citizens book their appointment remotely via web or mobile and receive an instant digital token with guaranteed queue slot.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm p-3">
                <Card.Body>
                  <div className="feature-icon bg-warning text-dark mb-3">
                    <FaBrain size={24} />
                  </div>
                  <h4 className="fw-bold">2. Predictive ML Waiting Time</h4>
                  <p className="text-muted">
                    Our Scikit-learn Random Forest model calculates expected wait time based on queue length, counter availability, and time of day.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm p-3">
                <Card.Body>
                  <div className="feature-icon bg-success text-white mb-3">
                    <FaChartLine size={24} />
                  </div>
                  <h4 className="fw-bold">3. Continuous Retraining</h4>
                  <p className="text-muted">
                    Every completed service automatically logs the actual waiting time into MongoDB, continuously training V2 & V3 ML models for higher accuracy.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default LandingPage;
