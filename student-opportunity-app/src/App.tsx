import { useEffect, useState } from "react";
import "./App.css";

type Opportunity = {
  id: number;
  title: string;
  type: string;
  location: string;
  eligibility: string;
  deadline: string;
};

const App = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  useEffect(() => {
    fetch(
      `http://localhost:3001/opportunities?search=${searchTerm}&type=${type}&location=${location}`,
    )
      .then((response) => response.json())
      .then((data) => {
        setOpportunities(data);
      });
  }, [searchTerm, type, location]);

  return (
    <div>
      <h1>Student Opportunity Checker</h1>
      <input
        type="text"
        placeholder="Search opportunities"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />
      <select value={type} onChange={(event) => setType(event.target.value)}>
        <option value="">All Types</option>
        <option value="Internship">Internship</option>
        <option value="Hackathon">Hackathon</option>
        <option value="Competition">Competition</option>
      </select>
      <select
        value={location}
        onChange={(event) => setLocation(event.target.value)}
      >
        <option value="">All Locations</option>
        <option value="London">London</option>
        <option value="Manchester">Manchester</option>
        <option value="Remote">Remote</option>
      </select>
      <table className="opportunity-table">
        <thead>
          <tr>
            <th className="table-heading">Name</th>
            <th className="table-heading">Type</th>
            <th className="table-heading">Location</th>
            <th className="table-heading">Eligibility</th>
            <th className="table-heading">Deadline</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opportunity) => (
            <tr key={opportunity.id}>
              <td className="table-data">{opportunity.title}</td>
              <td className="table-data">{opportunity.type}</td>
              <td className="table-data">{opportunity.location}</td>
              <td className="table-data">{opportunity.eligibility}</td>
              <td className="table-data">{opportunity.deadline}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
