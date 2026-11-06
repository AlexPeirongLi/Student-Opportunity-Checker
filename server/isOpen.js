const DAYS_ADVERTS_STAY_OPEN = 60;

function toDateText(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isOpen(opportunity) {
  const today = new Date();
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
}

module.exports = {isOpen, toDateText, DAYS_ADVERTS_STAY_OPEN};
