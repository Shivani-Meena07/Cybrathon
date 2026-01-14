import './ServiceCard.css';

/**
 * ServiceCard Component
 * Displays a selectable service for token generation
 */
function ServiceCard({ service, isSelected, onSelect }) {
  // Service emoji mapping
  const getServiceEmoji = (name) => {
    switch (name.toLowerCase()) {
      case 'fees payment':
        return '💳';
      case 'document issuance':
        return '📄';
      case 'id card generation':
        return '🆔';
      case 'approval request':
        return '✍️';
      case 'grievance registration':
        return '🗣️';
      default:
        return '📋';
    }
  };

  return (
    <button
      className={`service-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      title={`Select ${service.name}`}
    >
      <span className="service-emoji">{getServiceEmoji(service.name)}</span>
      <div className="service-info">
        <span className="service-name">{service.name}</span>
        <span className="service-counter">{service.counter}</span>
      </div>
      {isSelected && <span className="check-mark">✓</span>}
    </button>
  );
}

export default ServiceCard;
