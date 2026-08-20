import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaTicketAlt, 
  FaClock, 
  FaBuilding, 
  FaCheckCircle, 
  FaHourglassHalf, 
  FaTimesCircle,
  FaArrowRight
} from 'react-icons/fa';

const TokenCard = ({ token, onCancel }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'waiting':
        return <Badge bg="warning" text="dark"><FaHourglassHalf className="me-1" /> Waiting</Badge>;
      case 'serving':
        return <Badge bg="success" className="pulse-animation"><FaCheckCircle className="me-1" /> Currently Serving</Badge>;
      case 'completed':
        return <Badge bg="secondary"><FaCheckCircle className="me-1" /> Completed</Badge>;
      case 'cancelled':
        return <Badge bg="danger"><FaTimesCircle className="me-1" /> Cancelled</Badge>;
      default:
        return <Badge bg="light" text="dark">{status}</Badge>;
    }
  };

  const isActive = token.status === 'waiting' || token.status === 'serving';

  return (
    <Card className={`custom-card token-card mb-3 ${isActive ? 'active-token-card' : ''}`}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="token-number-badge">{token.tokenNumber}</span>
              {getStatusBadge(token.status)}
            </div>
            <h5 className="service-name-title mt-2 mb-1">{token.service?.name || 'Government Service'}</h5>
            <p className="office-location-text mb-2">
              <FaBuilding className="me-1 text-primary" /> {token.office?.name} ({token.office?.city})
            </p>
          </div>
        </div>

        <div className="token-meta-grid my-3 p-2 rounded bg-light">
          <div className="meta-item">
            <span className="meta-label">Queue Position</span>
            <span className="meta-value text-primary font-monospace fw-bold">
              {token.status === 'waiting' ? `#${token.queuePosition || 1}` : token.status === 'serving' ? 'Counter Assigned' : '-'}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Est. Wait Time</span>
            <span className="meta-value text-warning fw-bold">
              <FaClock className="me-1" />
              {token.predictedWaitingTime ? `${token.predictedWaitingTime} mins (AI)` : token.status === 'waiting' ? `~${(token.queuePosition || 1) * 15} mins` : '-'}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Date</span>
            <span className="meta-value">{token.date || new Date(token.arrivalTime).toLocaleDateString()}</span>
          </div>
          {token.counter && (
            <div className="meta-item">
              <span className="meta-label">Counter</span>
              <span className="meta-value text-success fw-bold">Counter #{token.counter?.counterNumber || token.counter}</span>
            </div>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-center pt-2">
          <Link to={`/token/${token._id}`} className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1">
            View Live Status <FaArrowRight />
          </Link>
          {isActive && onCancel && (
            <Button 
              variant="outline-danger" 
              size="sm" 
              onClick={() => onCancel(token._id)}
            >
              Cancel Token
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default TokenCard;
