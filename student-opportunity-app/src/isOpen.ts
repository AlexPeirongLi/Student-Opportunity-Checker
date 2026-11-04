// Decides whether an opportunity is "currently open", for the timeline (and any "open only" filter).
//
// Rules, checked in order:
//   1. Status "Rejected"       -> closed (you're done with it)
//   2. Has a deadline          -> open until the end of that day
//   3. Has a posted date only  -> open for 60 days after posting (Adzuna jobs have no deadline,
//                                 and most adverts close within a couple of months)
//   4. Neither date            -> open (we can't tell, so don't hide it)
//
// Dates come from the server as "YYYY-MM-DD" text (dateStrings: true in server.js).
// Text in that format sorts the same way as the dates, so plain >= comparisons work.

export const DAYS_ADVERTS_STAY_OPEN = 60;

type HasDates = {
  status: string;
  deadline: string | null;
  posted_date: string | null;
};

// today (or any day) as "YYYY-MM-DD"
const toDateText = (date: Date) => date.toISOString().slice(0, 10);

export const isOpen = (opportunity: HasDates, today = new Date()) => {
  if (opportunity.status === "Rejected") {
    return false;
  }

  if (opportunity.deadline) {
    return opportunity.deadline >= toDateText(today);
  }

  if (opportunity.posted_date) {
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - DAYS_ADVERTS_STAY_OPEN);
    return opportunity.posted_date >= toDateText(cutoff);
  }

  return true;
};
