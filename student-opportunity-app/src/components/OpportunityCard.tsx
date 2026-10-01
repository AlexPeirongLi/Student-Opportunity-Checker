interface OpportunityInfo {
  title: string;
  type: string;
  deadline: string;
}

function OpportunityCard({ title, type, deadline }: OpportunityInfo) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{type}</p>
      <p>Deadline: {deadline}</p>
    </div>
  );
}

export default OpportunityCard;
