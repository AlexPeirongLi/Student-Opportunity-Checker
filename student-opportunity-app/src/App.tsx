import { useEffect, useState } from "react";
import "./App.css";

type Opportunity = {
  id: number;
  title: string;
  type: string;
  deadline: string;
};

const App = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    fetch(`http://localhost:3001/opportunities?search=${searchTerm}`)
      .then((response) => response.json())
      .then((data) => {
        setOpportunities(data);
      });
  }, [searchTerm]);
  return (
    <div>
      <h1>Student Opportunity Checker</h1>
      <input
        type="text"
        placeholder="Search opportunities"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />
      <table className="opportunity-table">
        <thead>
          <tr>
            <th className="table-heading">Name</th>
            <th className="table-heading">Type</th>
            <th className="table-heading">Deadline</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opportunity) => (
            <tr key={opportunity.id}>
              <td className="table-data">{opportunity.title}</td>
              <td className="table-data">{opportunity.type}</td>
              <td className="table-data">{opportunity.deadline}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
