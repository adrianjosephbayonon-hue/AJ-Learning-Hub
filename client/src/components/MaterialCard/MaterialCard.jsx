import "./MaterialCard.css";

function MaterialCard({
  title,
  type,
  size,
}) {
  return (
    <div className="material-card">
      <h3>{title}</h3>

      <p>{type}</p>

      <p>{size}</p>

      <button>Download</button>
    </div>
  );
}

export default MaterialCard;