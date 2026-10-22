import "./StatCard.css";

const StatCard = ({
  title,
  value,
  icon: Icon,
  className = "",
}) => {
  const renderIcon = () => {
    if (!Icon) return null;

    // If icon is a string, render it as an image URL
    if (typeof Icon === "string") {
      return <img src={Icon} alt="" />;
    }

    // Otherwise, render it as a React component
    return <Icon />;
  };

  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>

        {Icon && (
          <span className="stat-card-icon">
            {renderIcon()}
          </span>
        )}
      </div>

      <div className="stat-card-value">
        {value}
      </div>
    </div>
  );
};

export default StatCard;
