import { useEffect, useState } from "react";
import AddOpportunity from "./AddOpportunity";
import "./App.css";

type Opportunity = {
  id: number;
  title: string;
  type: string;
  location: string;
  eligibility: string;
  deadline: string;
  status: string;
};

const App = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [showAddPage, setShowAddPage] = useState(false);
  const getOpportunities = () => {
    fetch(
      `http://localhost:3001/opportunities?search=${searchTerm}&type=${type}&location=${location}`,
    )
      .then((response) => response.json())
      .then((data) => {
        setOpportunities(data);
      });
  };

  useEffect(() => {
    getOpportunities();
  }, [searchTerm, type, location]);

  const changeStatus = (id: number, newStatus: string) => {
    fetch(`http://localhost:3001/opportunities/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: newStatus,
      }),
    }).then(() => {
      getOpportunities();
    });
  };

  if (showAddPage) {
    return (
      <AddOpportunity
        onBack={() => setShowAddPage(false)}
        onAdded={() => {
          setShowAddPage(false);
          getOpportunities();
        }}
      />
    );
  }

  return (
    <div>
      <h1>Student Opportunity Checker</h1>
      <button onClick={() => setShowAddPage(true)}>Add Opportunity</button>
      <div>
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
      </div>
      <table className="opportunity-table">
        <thead>
          <tr>
            <th className="table-heading">Name</th>
            <th className="table-heading">Type</th>
            <th className="table-heading">Location</th>
            <th className="table-heading">Eligibility</th>
            <th className="table-heading">Deadline</th>
            <th className="table-heading">Status</th>
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
              <td className="table-data">
                <select
                  value={opportunity.status}
                  onChange={(event) =>
                    changeStatus(opportunity.id, event.target.value)
                  }
                >
                  <option value="Not Applied">Not Applied</option>
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
