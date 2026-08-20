import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaBell, FaSms, FaEnvelope, FaMobileAlt, FaCheckCircle, FaRobot } from 'react-icons/fa';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    smsAlerts: true,
    emailAlerts: false,
    turnApproachAlert: true,
    turnApproachPositions: '2',
    aiDelayPredictionAlert: true,
    completionReceipt: true
  });
  const [saved, setSaved] = useState(false);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('tn_queue_notifications', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="mb-4">
            <h3 className="fw-bold">
              <FaBell className="me-2 text-primary" /> Notification Settings
            </h3>
            <p className="text-muted">
              Configure real-time SMS and digital alerts for your queue tokens and AI wait times.
            </p>
          </div>

          {saved && (
            <Alert variant="success" className="d-flex align-items-center gap-2">
              <FaCheckCircle /> Notification preferences saved successfully!
            </Alert>
          )}

          <Card className="border-0 shadow-sm p-3">
            <Card.Body>
              <Form onSubmit={handleSave}>
                <h5 className="fw-bold mb-3 text-primary">Delivery Channels</h5>

                <div className="d-flex justify-content-between align-items-center p-3 mb-2 rounded bg-light">
                  <div className="d-flex align-items-center gap-3">
                    <FaSms size={22} className="text-primary" />
                    <div>
                      <div className="fw-bold text-dark">SMS Notifications</div>
                      <div className="small text-muted">Receive token number & updates via text message</div>
                    </div>
                  </div>
                  <Form.Check 
                    type="switch"
                    id="sms-switch"
                    checked={settings.smsAlerts}
                    onChange={() => handleToggle('smsAlerts')}
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center p-3 mb-4 rounded bg-light">
                  <div className="d-flex align-items-center gap-3">
                    <FaEnvelope size={22} className="text-secondary" />
                    <div>
                      <div className="fw-bold text-dark">Email Confirmation</div>
                      <div className="small text-muted">Receive digital token pass to your registered email</div>
                    </div>
                  </div>
                  <Form.Check 
                    type="switch"
                    id="email-switch"
                    checked={settings.emailAlerts}
                    onChange={() => handleToggle('emailAlerts')}
                  />
                </div>

                <h5 className="fw-bold mb-3 text-primary">Smart Queue Triggers</h5>

                <div className="d-flex justify-content-between align-items-center p-3 mb-2 rounded bg-light">
                  <div className="d-flex align-items-center gap-3">
                    <FaBell size={22} className="text-warning" />
                    <div>
                      <div className="fw-bold text-dark">"Almost Your Turn" Proximity Alert</div>
                      <div className="small text-muted">Alert when you are within 2 positions of the counter</div>
                    </div>
                  </div>
                  <Form.Check 
                    type="switch"
                    id="turn-switch"
                    checked={settings.turnApproachAlert}
                    onChange={() => handleToggle('turnApproachAlert')}
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center p-3 mb-4 rounded bg-light">
                  <div className="d-flex align-items-center gap-3">
                    <FaRobot size={22} className="text-info" />
                    <div>
                      <div className="fw-bold text-dark">AI Delay Prediction Alert</div>
                      <div className="small text-muted">Notify if counter speed shifts expected wait by &gt;10 mins</div>
                    </div>
                  </div>
                  <Form.Check 
                    type="switch"
                    id="delay-switch"
                    checked={settings.aiDelayPredictionAlert}
                    onChange={() => handleToggle('aiDelayPredictionAlert')}
                  />
                </div>

                <Button type="submit" variant="primary" className="w-100 py-2 fw-bold btn-glow">
                  Save Preferences
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NotificationSettings;
