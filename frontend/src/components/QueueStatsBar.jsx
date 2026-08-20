import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FaUsers, FaUserCheck, FaCheckCircle, FaDesktop } from 'react-icons/fa';

const QueueStatsBar = ({ waitingCount = 0, servingCount = 0, completedCount = 0, activeCounters = 0 }) => {
  return (
    <Row className="g-3 mb-4">
      <Col xs={6} md={3}>
        <Card className="stat-card stat-waiting border-0 shadow-sm">
          <Card.Body className="d-flex align-items-center gap-3 p-3">
            <div className="stat-icon-wrapper bg-warning-subtle text-warning">
              <FaUsers size={22} />
            </div>
            <div>
              <div className="stat-number text-dark fw-bold fs-4">{waitingCount}</div>
              <div className="stat-title text-muted small fw-medium">Citizens Waiting</div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col xs={6} md={3}>
        <Card className="stat-card stat-serving border-0 shadow-sm">
          <Card.Body className="d-flex align-items-center gap-3 p-3">
            <div className="stat-icon-wrapper bg-success-subtle text-success">
              <FaUserCheck size={22} />
            </div>
            <div>
              <div className="stat-number text-dark fw-bold fs-4">{servingCount}</div>
              <div className="stat-title text-muted small fw-medium">Now Serving</div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col xs={6} md={3}>
        <Card className="stat-card stat-counters border-0 shadow-sm">
          <Card.Body className="d-flex align-items-center gap-3 p-3">
            <div className="stat-icon-wrapper bg-primary-subtle text-primary">
              <FaDesktop size={22} />
            </div>
            <div>
              <div className="stat-number text-dark fw-bold fs-4">{activeCounters}</div>
              <div className="stat-title text-muted small fw-medium">Active Counters</div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col xs={6} md={3}>
        <Card className="stat-card stat-completed border-0 shadow-sm">
          <Card.Body className="d-flex align-items-center gap-3 p-3">
            <div className="stat-icon-wrapper bg-info-subtle text-info">
              <FaCheckCircle size={22} />
            </div>
            <div>
              <div className="stat-number text-dark fw-bold fs-4">{completedCount}</div>
              <div className="stat-title text-muted small fw-medium">Completed Today</div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default QueueStatsBar;
