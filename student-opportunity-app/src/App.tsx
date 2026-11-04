import { useEffect, useState } from "react";
import AddOpportunity from "./AddOpportunity";
// TODO (STEP 7): import ImportAdzuna from "./ImportAdzuna";
import "./App.css";

// TODO (STEP 7): imported rows have new columns and some empty ones. Update this type:
//   - add source: string and url: string | null
//   - add posted_date: string | null (when it opened; used by the timeline and isOpen())
//   - location, eligibility and deadline can now be null (string | null)
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
  // TODO (STEP 7): add a showImportPage state, the same way as showAddPage
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

  // TODO (STEP 7): like the `if (showAddPage)` block above, return <ImportAdzuna onBack={...} onImported={...} />
  // when showImportPage is true. onImported should hide the page and call getOpportunities().

  return (
    <div>
      <h1>Student Opportunity Checker</h1>
      <button onClick={() => setShowAddPage(true)}>Add Opportunity</button>
      {/* TODO (STEP 7): an "Import from Adzuna" button that sets showImportPage to true */}
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
          {/* TODO (STEP 7): toOpportunity() also gives "Graduate" and "Job". Add options for them */}
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
            {/* TODO (STEP 8): add a "Link" heading */}
            {/* LATER (timeline): a "Posted" column, and an "Open only" checkbox that filters with
                opportunities.filter((o) => isOpen(o)). isOpen is in src/isOpen.ts */}
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opportunity) => (
            <tr key={opportunity.id}>
              <td className="table-data">{opportunity.title}</td>
              <td className="table-data">{opportunity.type}</td>
              <td className="table-data">{opportunity.location}</td>
              <td className="table-data">{opportunity.eligibility}</td>
              {/* TODO (STEP 8): imported rows have no deadline. Show "Not stated" when it's null (?? helps) */}
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
              {/* TODO (STEP 8): a cell with an "Apply" link to opportunity.url (target="_blank" rel="noreferrer"),
                  only when url isn't null. For source === "adzuna" rows, also show a small "via Adzuna" link
                  to https://www.adzuna.co.uk (their terms require crediting them). */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
