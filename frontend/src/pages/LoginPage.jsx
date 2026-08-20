import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ButtonGroup, ToggleButton } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaLock, FaEnvelope, FaUserShield, FaUser, FaSignInAlt } from 'react-icons/fa';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen'); // 'citizen' or 'admin'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Quick fill helper for presentation/testing
  const handleQuickFill = (targetRole) => {
    if (targetRole === 'admin') {
      setEmail('admin@queue.com');
      setPassword('admin123');
      setRole('admin');
    } else {
      setEmail('rahul@example.com');
      setPassword('citizen123');
      setRole('citizen');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={5}>
          <Card className="auth-card border-0 shadow-lg p-4">
            <Card.Body>
              <div className="text-center mb-4">
                <div className="auth-icon-circle mx-auto mb-3 bg-primary-subtle text-primary">
                  <FaSignInAlt size={28} />
                </div>
                <h3 className="fw-bold">TN Smart Queue</h3>
                <p className="text-muted">Select role and sign in to continue</p>
              </div>

              {/* Role Selection Tabs */}
              <div className="role-selector mb-4">
                <ButtonGroup className="w-100">
                  <ToggleButton
                    id="role-citizen"
                    type="radio"
                    variant={role === 'citizen' ? 'primary' : 'outline-secondary'}
                    name="role"
                    value="citizen"
                    checked={role === 'citizen'}
                    onChange={(e) => setRole(e.currentTarget.value)}
                    className="py-2 fw-semibold"
                  >
                    <FaUser className="me-2" /> Citizen
                  </ToggleButton>
                  <ToggleButton
                    id="role-admin"
                    type="radio"
                    variant={role === 'admin' ? 'dark' : 'outline-secondary'}
                    name="role"
                    value="admin"
                    checked={role === 'admin'}
                    onChange={(e) => setRole(e.currentTarget.value)}
                    className="py-2 fw-semibold"
                  >
                    <FaUserShield className="me-2" /> Office Admin
                  </ToggleButton>
                </ButtonGroup>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium">Email Address</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <FaEnvelope className="text-muted" />
                    </span>
                    <Form.Control
                      type="email"
                      className="border-start-0 ps-0"
                      placeholder={role === 'admin' ? 'admin@queue.com' : 'citizen@example.com'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium">Password</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <FaLock className="text-muted" />
                    </span>
                    <Form.Control
                      type="password"
                      className="border-start-0 ps-0"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </Form.Group>

                <Button 
                  variant={role === 'admin' ? 'dark' : 'primary'} 
                  type="submit" 
                  className="w-100 py-2 fw-bold btn-glow mb-3"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : `Sign in as ${role === 'admin' ? 'Admin' : 'Citizen'}`}
                </Button>
              </Form>

              {/* Demo Quick Fill Buttons */}
              <div className="demo-credentials-box p-3 bg-light rounded text-center small mt-3">
                <div className="text-muted mb-2 fw-semibold">Quick Demo Login:</div>
                <div className="d-flex gap-2 justify-content-center">
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={() => handleQuickFill('citizen')}
                  >
                    Demo Citizen
                  </Button>
                  <Button 
                    variant="outline-dark" 
                    size="sm" 
                    onClick={() => handleQuickFill('admin')}
                  >
                    Demo Admin
                  </Button>
                </div>
              </div>

              <div className="text-center mt-4 text-muted">
                Don't have an account?{' '}
                <Link to="/register" className="fw-semibold text-primary">
                  Register as Citizen
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
