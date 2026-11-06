# Student Opportunity Tracker: setup

Collects internships, jobs, hackathons and competitions from Adzuna, your emails and the Add form,
shows them in a table and on a timeline, and lets you ask an assistant questions about them.

## 1. Database (once)

Start Docker Desktop, then make sure the MySQL container is running:

```
docker start opportunity-mysql
```

Run each migration once, from the project folder, in order:

```
Get-Content server\migrations\001_add_source_columns.sql | docker exec -i opportunity-mysql mysql -u root -ppassword opportunity_tracker
Get-Content server\migrations\002_add_posted_date.sql | docker exec -i opportunity-mysql mysql -u root -ppassword opportunity_tracker
Get-Content server\migrations\003_add_emails_table.sql | docker exec -i opportunity-mysql mysql -u root -ppassword opportunity_tracker
```

(001 and 002 have already been run on this computer. 003 has too.)

## 2. Keys in server/.env

Copy `server/.env.example` to `server/.env` if you don't have one, and fill it in:

| Key | What it's for | Where to get it |
|---|---|---|
| `DB_PASSWORD` | MySQL password | `password` for the Docker container |
| `ADZUNA_APP_ID`, `ADZUNA_APP_KEY` | Import from Adzuna | developer.adzuna.com dashboard |
| `GEMINI_API_KEY` | Email reading and the Assistant | aistudio.google.com/apikey → Create API key (free, no card needed) |
| `GMAIL_ADDRESS`, `GMAIL_APP_PASSWORD` | Reading the Wednesday Waggle (forwarded to Gmail) | see below |

Restart the server after changing `.env`.

### Getting the Waggle into Gmail

The university blocks students from connecting apps to Outlook, so the Waggle is forwarded to Gmail instead.

1. In Outlook on the web (uni account): **Settings → Mail → Rules → Add new rule**. Condition **From** `duncan.hull@manchester.ac.uk`, action **Forward to** your Gmail. Untick "Stop processing more rules". Save.
2. In your Google account, turn on **2-Step Verification**, then go to myaccount.google.com/apppasswords and create an app password.
3. Put your Gmail address in `GMAIL_ADDRESS` and the 16-letter app password in `GMAIL_APP_PASSWORD`.

The app only reads emails whose subject contains "Wednesday Waggle" (change it in `server/settings.js`).

Gemini's free tier has a daily limit, and Google may use free-tier requests to improve its products. From Gmail, only Wednesday Waggle emails are sent to it. Anything you ask the Assistant is sent too.

## 3. Run it

Two terminals:

```
cd server
npm start
```

```
cd student-opportunity-app
npm run dev
```

Then open http://localhost:5173.

The app is one page: the timeline. Click any opportunity to see its details, open the Apply link, or change its status. **Check now** (top right) looks for new opportunities straight away, and **Ask AI** (bottom right) opens the assistant.

Once a week a Windows scheduled task checks for you, so nothing has to stay running. It runs every **Thursday at 1pm** and whenever you log in. If it's between Thursday 1pm and Friday 1pm and this week hasn't been checked yet, it starts Docker, runs your Adzuna searches, reads new Wednesday Waggle emails from Gmail, then stops Docker again (only if it wasn't already running). If something fails it tries again every 15 minutes, up to 4 times. `server/last-check.json` remembers which week is done, and `server/weekly-check.log` shows what happened.

To set the task up on a new computer, run `server/install-weekly-check.ps1` in PowerShell. To remove it, open Task Scheduler and delete "Student Opportunity Weekly Check"

Nothing is checked while the server is off.

## What each file does

| File | Job |
|---|---|
| `server/server.js` | All the routes (URLs) the React app calls |
| `server/db.js` | Connects to MySQL |
| `server/isOpen.js` | Decides if an opportunity is still open |
| `server/adzuna.js` | Searches Adzuna and reshapes its jobs |
| `server/gemini.js` | Sets up the Gemini client and turns its errors into plain messages |
| `server/emailAnalysis.js` | Gemini reads an email: a summary and the opportunities in it (structured output) |
| `server/assistant.js` | The Assistant: Gemini calls read-only tools that query MySQL (tool use) |
| `server/settings.js` | Things you might want to change: who to read emails from, the Adzuna searches, words to skip, how often to check |
| `server/checks.js` | The weekly check itself: Adzuna import and reading Waggle emails |
| `server/schedule.js` | Works out if it's between Thursday 1pm and Friday 1pm, and remembers which week is done |
| `server/weekly-check.ps1` | Starts Docker, runs the check, stops Docker (run by the scheduled task) |
| `server/is-check-due.js`, `server/weekly-check.js` | Small scripts the scheduled task runs |
| `server/install-weekly-check.ps1` | Creates the Windows scheduled task |
| `server/gmail.js` | Logs in to Gmail and reads the newest Wednesday Waggle emails |
| `student-opportunity-app/src/App.tsx` | The page: top bar, timeline and chat bubble |
| `student-opportunity-app/src/Timeline.tsx` | The timeline of open opportunities |
| `student-opportunity-app/src/OpportunityDetails.tsx` | The pop-up when you click an opportunity (details, status, Apply) |
| `student-opportunity-app/src/Assistant.tsx` | The Ask AI chat bubble |
| `student-opportunity-app/src/types.ts` | Shared types and lists (statuses, types, server URL) |

## When is an opportunity "open"?

1. Status is Rejected → closed.
2. Has a deadline → open until the end of that day.
3. Only has a posted date → open for 60 days after it was posted.
4. No dates at all → open.
