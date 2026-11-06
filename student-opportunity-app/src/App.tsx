import {useEffect, useState} from "react";
import Timeline from "./Timeline";
import Assistant from "./Assistant";
import {SERVER_URL} from "./types";
import type {Opportunity} from "./types";
import "./App.css";

const App = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [checking, setChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState("");
  const getOpportunities = () => {
    fetch(`${SERVER_URL}/opportunities`)
      .then((response) => response.json())
      .then((data) => {
        setOpportunities(data);
      });
  };
  useEffect(() => {
    getOpportunities();
  }, []);
  const checkNow = async () => {
    setChecking(true);
    setCheckMessage("");
    try {
      const response = await fetch(`${SERVER_URL}/checks/run`, {method: "POST"});
      const result = await response.json();
      if (response.ok) {
        setCheckMessage(`Adzuna: ${result.adzuna}. Emails: ${result.emails}.`);
        getOpportunities();
      } else {
        setCheckMessage(result.error);
      }
    } catch {
      setCheckMessage("Could not reach the server");
    }
    setChecking(false);
  };

  return (
    <div className="app">
      <header className="top-bar">
        <h1>Student Opportunity Tracker</h1>
        <button onClick={checkNow} disabled={checking}>
          {checking ? "Checking..." : "Check now"}
        </button>
      </header>
      {checkMessage !== "" && <p className="small check-message">{checkMessage}</p>}
      <Timeline opportunities={opportunities} onChanged={getOpportunities} />
      <Assistant />
    </div>
  );
};

export default App;
