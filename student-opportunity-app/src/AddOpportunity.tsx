import { useState } from "react";

type AddOpportunityProps = {
  onBack: () => void;
  onAdded: () => void;
};

const AddOpportunity = ({ onBack, onAdded }: AddOpportunityProps) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [deadline, setDeadline] = useState("");

  const addOpportunity = () => {
    fetch("http://localhost:3001/opportunities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        type: type,
        location: location,
        eligibility: eligibility,
        deadline: deadline,
      }),
    }).then(() => {
      onAdded();
    });
  };

  return (
    <div className="add-page">
      <h1>Add Opportunity</h1>
      <div className="add-form">
        <label>Name</label>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <label>Type</label>
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="">Choose Type</option>
          <option value="Internship">Internship</option>
          <option value="Hackathon">Hackathon</option>
          <option value="Competition">Competition</option>
        </select>
        <label>Location</label>
        <input
          type="text"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />
        <label>Eligibility</label>
        <input
          type="text"
          value={eligibility}
          onChange={(event) => setEligibility(event.target.value)}
        />
        <label>Deadline</label>
        <input
          type="date"
          value={deadline}
          onChange={(event) => setDeadline(event.target.value)}
        />
        <div className="form-buttons">
          <button onClick={onBack}>Back</button>
          <button onClick={addOpportunity}>Add Opportunity</button>
        </div>
      </div>
    </div>
  );
};

export default AddOpportunity;
