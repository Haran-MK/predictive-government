import React from 'react';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaQrcode, 
  FaUserShield, 
  FaUser, 
  FaSignOutAlt, 
  FaPlusCircle, 
  FaClock, 
  FaBell, 
  FaChartLine 
} from 'react-icons/fa';

const AppNavbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Navbar expand="lg" className="navbar-custom sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 brand-logo">
          <div className="brand-icon-wrapper">
            <FaQrcode className="brand-icon" />
          </div>
          <div className="d-flex flex-column">
            <span className="brand-title">TN Smart Queue</span>
            <span className="brand-subtitle">Predictive Crowd Management</span>
          </div>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar-nav" className="border-0 shadow-none text-light" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="ms-auto align-items-center gap-2 mt-3 mt-lg-0">
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <>
                    <Nav.Link 
                      as={Link} 
                      to="/admin" 
                      className={`nav-item-custom ${isActive('/admin') ? 'active' : ''}`}
                    >
                      <FaChartLine className="me-1" /> Admin Dashboard
                    </Nav.Link>
                  </>
                ) : (
                  <>
                    <Nav.Link 
                      as={Link} 
                      to="/dashboard" 
                      className={`nav-item-custom ${isActive('/dashboard') ? 'active' : ''}`}
                    >
                      <FaUser className="me-1" /> Dashboard
                    </Nav.Link>
                    <Nav.Link 
                      as={Link} 
                      to="/book" 
                      className={`nav-item-custom ${isActive('/book') ? 'active' : ''}`}
                    >
                      <FaPlusCircle className="me-1" /> Book Token
                    </Nav.Link>
                    <Nav.Link 
                      as={Link} 
                      to="/settings/notifications" 
                      className={`nav-item-custom ${isActive('/settings/notifications') ? 'active' : ''}`}
                    >
                      <FaBell className="me-1" /> Notifications
                    </Nav.Link>
                  </>
                )}

                <div className="d-flex align-items-center gap-2 ms-lg-3 user-badge-container">
                  <Badge bg={isAdmin ? "danger" : "info"} className="role-badge">
                    {isAdmin ? <FaUserShield className="me-1" /> : <FaUser className="me-1" />}
                    {user?.name || (isAdmin ? 'Admin' : 'Citizen')}
                  </Badge>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={handleLogout}
                    className="d-flex align-items-center gap-1 btn-logout"
                  >
                    <FaSignOutAlt /> <span className="d-none d-sm-inline">Logout</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/login" 
                  className={`nav-item-custom ${isActive('/login') ? 'active' : ''}`}
                >
                  Login
                </Nav.Link>
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="primary" 
                  size="sm" 
                  className="btn-glow px-3 py-2 fw-semibold"
                >
                  Register
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
