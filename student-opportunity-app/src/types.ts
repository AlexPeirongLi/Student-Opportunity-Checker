export type Opportunity = {
  id: number;
  title: string;
  type: string;
  location: string | null;
  eligibility: string | null;
  deadline: string | null;
  status: string;
  source: string;
  url: string | null;
  posted_date: string | null;
  is_open: boolean;
};

export const SERVER_URL = "http://localhost:3001";
export const STATUSES = ["Not Applied", "Applied", "Interview", "Offer", "Rejected"];
