import {SERVER_URL, STATUSES} from "./types";
import type {Opportunity} from "./types";

type OpportunityDetailsProps = {
  opportunity: Opportunity;
  onClose: () => void;
  onChanged: () => void;
};

const OpportunityDetails = ({opportunity, onClose, onChanged}: OpportunityDetailsProps) => {
  const changeStatus = (newStatus: string) => {
    fetch(`${SERVER_URL}/opportunities/${opportunity.id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({status: newStatus}),
    }).then(() => {
      onChanged();
    });
  };

  return (
    <div className="overlay">
      <div className="details">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h2>{opportunity.title}</h2>
        <p>
          <strong>Type:</strong> {opportunity.type}
        </p>
        <p>
          <strong>Location:</strong> {opportunity.location ?? "Not stated"}
        </p>
        <p>
          <strong>Who can apply:</strong> {opportunity.eligibility ?? "Not stated"}
        </p>
        <p>
          <strong>Opened:</strong> {opportunity.posted_date ?? "Unknown"}
        </p>
        <p>
          <strong>Deadline:</strong> {opportunity.deadline ?? "Not stated"}
        </p>
        <label>
          <strong>Status: </strong>
          <select value={opportunity.status} onChange={(event) => changeStatus(event.target.value)}>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        {opportunity.url && (
          <p>
            <a href={opportunity.url} target="_blank" rel="noreferrer">
              Apply
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default OpportunityDetails;
