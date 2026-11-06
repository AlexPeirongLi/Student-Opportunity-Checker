import {useState} from "react";
import OpportunityDetails from "./OpportunityDetails";
import type {Opportunity} from "./types";

type TimelineProps = {
  opportunities: Opportunity[];
  onChanged: () => void;
};

type DayGroup = {
  date: string;
  opportunities: Opportunity[];
};

const ONE_DAY = 24 * 60 * 60 * 1000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LANES = ["above-1", "below-1", "above-2", "below-2", "above-3", "below-3"];

const dayNumber = (dateText: string) => {
  return Date.parse(dateText) / ONE_DAY;
};

const dateTextOf = (day: number) => {
  return new Date(day * ONE_DAY).toISOString().slice(0, 10);
};

const monthName = (dateText: string) => {
  return MONTHS[Number(dateText.slice(5, 7)) - 1];
};

const prettyDate = (dateText: string) => {
  return `${Number(dateText.slice(8, 10))} ${monthName(dateText)}`;
};

const todayText = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

const startDateOf = (opportunity: Opportunity) => {
  if (opportunity.posted_date) {
    return opportunity.posted_date;
  }
  if (opportunity.deadline) {
    return opportunity.deadline;
  }
  return "";
};

const groupByDay = (opportunities: Opportunity[]) => {
  const groups: DayGroup[] = [];
  for (const opportunity of opportunities) {
    const date = startDateOf(opportunity);
    const existing = groups.find((group) => group.date === date);
    if (existing) {
      existing.opportunities.push(opportunity);
    } else {
      groups.push({date: date, opportunities: [opportunity]});
    }
  }
  groups.sort((a, b) => dayNumber(a.date) - dayNumber(b.date));
  return groups;
};

const Timeline = ({opportunities, onChanged}: TimelineProps) => {
  const [selectedId, setSelectedId] = useState(0);
  const selected = opportunities.find((opportunity) => opportunity.id === selectedId);
  const open = opportunities.filter((opportunity) => opportunity.is_open);
  const withDates = open.filter((opportunity) => startDateOf(opportunity) !== "");
  const noDates = open.filter((opportunity) => startDateOf(opportunity) === "");
  const groups = groupByDay(withDates);
  if (open.length === 0) {
    return <p className="empty">No open opportunities yet. Press "Check now" to look for some.</p>;
  }
  const today = todayText();
  let earliest = today;
  let latest = today;
  for (const opportunity of withDates) {
    if (startDateOf(opportunity) < earliest) {
      earliest = startDateOf(opportunity);
    }
    if (opportunity.deadline && opportunity.deadline > latest) {
      latest = opportunity.deadline;
    }
  }
  const firstDay = dayNumber(earliest.slice(0, 7) + "-01");
  const lastDay = dayNumber(latest) + 7;
  const totalDays = lastDay - firstDay;
  const monthStarts = [];
  for (let day = firstDay; day <= lastDay; day++) {
    const dateText = dateTextOf(day);
    if (dateText.endsWith("-01")) {
      monthStarts.push(dateText);
    }
  }
  const width = Math.max(1000, groups.length * 130, totalDays * 30);
  const pixelsPerDay = width / totalDays;
  const leftOf = (dateText: string) => {
    return (dayNumber(dateText) - firstDay) * pixelsPerDay;
  };

  return (
    <div>
      <p className="small">
        {withDates.length} open opportunities, placed on the day they opened. The green line is today. Click one for
        details.
      </p>
      <div className="timeline-scroll">
        <div className="timeline" style={{width: width}}>
          <div className="timeline-line" />
          {monthStarts.map((monthStart) => (
            <div key={monthStart} className="timeline-month" style={{left: leftOf(monthStart)}}>
              {monthName(monthStart)}
            </div>
          ))}
          <div className="timeline-today" style={{left: leftOf(today)}} />
          {groups.map((group, index) => {
            const first = group.opportunities[0];
            const lane = LANES[index % LANES.length];
            return (
              <div key={group.date} className={`timeline-item ${lane}`} style={{left: leftOf(group.date)}}>
                <div className="timeline-dot" />
                <div className="timeline-stem" />
                {group.opportunities.length === 1 ? (
                  <div className="timeline-card clickable" onClick={() => setSelectedId(first.id)}>
                    <strong>{first.title}</strong>
                    <div>{first.type}</div>
                    <div>Opened {prettyDate(group.date)}</div>
                    <div>{first.deadline ? `Closes ${prettyDate(first.deadline)}` : "No deadline given"}</div>
                    {first.status !== "Not Applied" && <div className="status-tag">{first.status}</div>}
                  </div>
                ) : (
                  <div className="timeline-card group-card">
                    <strong>
                      {group.opportunities.length} opened {prettyDate(group.date)}
                    </strong>
                    {group.opportunities.map((opportunity) => (
                      <div
                        key={opportunity.id}
                        className="timeline-card-row clickable"
                        onClick={() => setSelectedId(opportunity.id)}
                      >
                        {opportunity.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {noDates.length > 0 && (
        <div className="timeline-undated">
          <h2>Open, but no dates</h2>
          <ul>
            {noDates.map((opportunity) => (
              <li key={opportunity.id} className="clickable" onClick={() => setSelectedId(opportunity.id)}>
                {opportunity.title} ({opportunity.type})
              </li>
            ))}
          </ul>
        </div>
      )}
      {selected && (
        <OpportunityDetails opportunity={selected} onClose={() => setSelectedId(0)} onChanged={onChanged} />
      )}
    </div>
  );
};

export default Timeline;
