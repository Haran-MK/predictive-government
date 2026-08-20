import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  FaBuilding, 
  FaClipboardList, 
  FaClock, 
  FaCheckCircle, 
  FaArrowRight, 
  FaArrowLeft,
  FaMapMarkerAlt
} from 'react-icons/fa';

const ServiceSelection = () => {
  const [offices, setOffices] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [step, setStep] = useState(1); // Step 1: Select Office, Step 2: Select Service, Step 3: Confirmation
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const res = await api.get('/offices');
        setOffices(res.data);
      } catch (err) {
        setError('Failed to load offices.');
      } finally {
        setLoading(false);
      }
    };
    fetchOffices();
  }, []);

  const handleSelectOffice = async (office) => {
    setSelectedOffice(office);
    setSelectedService(null);
    setLoading(true);
    try {
      const res = await api.get(`/services/office/${office._id}`);
      setServices(res.data);
      setStep(2);
    } catch (err) {
      setError('Failed to load services for this office.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectService = (service) => {
    setSelectedService(service);
    setStep(3);
  };

  const handleConfirmBooking = async () => {
    if (!selectedOffice || !selectedService) return;
    setBookingLoading(true);
    setError('');

    try {
      const res = await api.post('/queue/book', {
        office: selectedOffice._id,
        service: selectedService._id
      });
      // Redirect directly to digital token screen
      navigate(`/token/${res.data.token._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book token.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <Container className="py-4">
      {/* Progress Bar Header */}
      <div className="booking-stepper mb-4 p-3 bg-white rounded-3 shadow-sm border">
        <div className="d-flex justify-content-around text-center">
          <div className={`step-item ${step >= 1 ? 'active text-primary fw-bold' : 'text-muted'}`}>
            <span className="step-number rounded-circle px-2 py-1 bg-primary-subtle text-primary me-2">1</span>
            Select Office
          </div>
          <div className={`step-item ${step >= 2 ? 'active text-primary fw-bold' : 'text-muted'}`}>
            <span className="step-number rounded-circle px-2 py-1 bg-primary-subtle text-primary me-2">2</span>
            Select Service
          </div>
          <div className={`step-item ${step >= 3 ? 'active text-primary fw-bold' : 'text-muted'}`}>
            <span className="step-number rounded-circle px-2 py-1 bg-primary-subtle text-primary me-2">3</span>
            Confirm Token
          </div>
        </div>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      {/* Step 1: Select Office */}
      {step === 1 && (
        <div>
          <div className="mb-4">
            <h3 className="fw-bold">Step 1: Choose Government Office</h3>
            <p className="text-muted">Select the department location you need to visit.</p>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Row className="g-4">
              {offices.map((office) => (
                <Col md={6} key={office._id}>
                  <Card 
                    className="custom-card office-card h-100 border-0 shadow-sm hover-elevate cursor-pointer p-2"
                    onClick={() => handleSelectOffice(office)}
                  >
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="office-icon-wrapper bg-primary-subtle text-primary p-3 rounded-circle">
                          <FaBuilding size={24} />
                        </div>
                        <Badge bg="success" className="px-2 py-1">Open</Badge>
                      </div>
                      <h5 className="fw-bold text-dark mt-2 mb-1">{office.name}</h5>
                      <p className="text-muted small mb-2">
                        <FaMapMarkerAlt className="me-1 text-danger" /> {office.address}, {office.city}
                      </p>
                      <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top small text-muted">
                        <span><FaClock className="me-1" /> {office.operatingHours?.open} - {office.operatingHours?.close}</span>
                        <span className="text-primary fw-bold d-flex align-items-center gap-1">
                          Select <FaArrowRight size={12} />
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      )}

      {/* Step 2: Select Service */}
      {step === 2 && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold">Step 2: Choose Service</h3>
              <p className="text-muted">Office: <strong>{selectedOffice?.name}</strong></p>
            </div>
            <Button variant="outline-secondary" size="sm" onClick={() => setStep(1)}>
              <FaArrowLeft className="me-1" /> Change Office
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Row className="g-3">
              {services.map((service) => (
                <Col md={6} key={service._id}>
                  <Card 
                    className="custom-card service-card h-100 border-0 shadow-sm hover-elevate cursor-pointer p-2"
                    onClick={() => handleSelectService(service)}
                  >
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className="fw-bold text-dark mb-1">{service.name}</h5>
                          <p className="text-muted small mb-2">{service.description || 'Standard public sector application processing'}</p>
                        </div>
                        <div className="service-duration-badge bg-warning-subtle text-dark px-2 py-1 rounded small fw-bold text-nowrap">
                          <FaClock className="me-1" /> ~{service.avgServiceDuration}m
                        </div>
                      </div>
                      <div className="text-end mt-3">
                        <span className="btn btn-outline-primary btn-sm fw-semibold">
                          Choose Service <FaArrowRight className="ms-1" size={12} />
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="border-0 shadow-lg p-4">
              <Card.Body>
                <div className="text-center mb-4">
                  <div className="confirm-icon bg-success-subtle text-success p-3 rounded-circle d-inline-block mb-3">
                    <FaCheckCircle size={32} />
                  </div>
                  <h4 className="fw-bold">Confirm Digital Token</h4>
                  <p className="text-muted">Review your selection before generating your smart token.</p>
                </div>

                <div className="booking-summary-box p-3 bg-light rounded-3 mb-4">
                  <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                    <span className="text-muted">Office Location:</span>
                    <span className="fw-bold text-dark">{selectedOffice?.name}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                    <span className="text-muted">Selected Service:</span>
                    <span className="fw-bold text-primary">{selectedService?.name}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                    <span className="text-muted">Estimated Duration:</span>
                    <span className="fw-semibold text-dark">{selectedService?.avgServiceDuration} minutes</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Token Date:</span>
                    <span className="fw-bold text-dark">{new Date().toISOString().split('T')[0]}</span>
                  </div>
                </div>

                <div className="d-flex gap-3">
                  <Button 
                    variant="outline-secondary" 
                    className="w-50 py-2 fw-semibold"
                    onClick={() => setStep(2)}
                  >
                    <FaArrowLeft className="me-1" /> Back
                  </Button>
                  <Button 
                    variant="primary" 
                    className="w-50 py-2 fw-bold btn-glow"
                    onClick={handleConfirmBooking}
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? 'Generating...' : 'Generate Token 🎟️'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ServiceSelection;
