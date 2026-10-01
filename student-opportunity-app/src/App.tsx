import OpportunityCard from "./components/OpportunityCard";

function App() {
  const opportunities = [
    {
      id: 1,
      title: "Google Internship",
      type: "Internship",
      deadline: "20 October",
    },
    {
      id: 2,
      title: "GreatUniHack",
      type: "Hackathon",
      deadline: "10 November",
    },
  ];

  return (
    <div>
      <h1>Student Opportunity Checker</h1>

      {opportunities.map((opportunity) => (
        <OpportunityCard
          key={opportunity.id}
          title={opportunity.title}
          type={opportunity.type}
          deadline={opportunity.deadline}
        />
      ))}
    </div>
  );
}

export default App;
