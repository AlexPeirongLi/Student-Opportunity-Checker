import { useState } from "react";

type ImportAdzunaProps = {
  onBack: () => void;
  onImported: () => void;
};

type AdzunaResult = {
  title: string;
  type: string;
  location: string | null;
  eligibility: string | null;
  deadline: string | null;
  source: string;
  external_id: string;
  url: string;
  posted_date: string | null;
};

const ImportAdzuna = ({ onBack, onImported }: ImportAdzunaProps) => {
  const [what, setWhat] = useState("");
  const [where, setWhere] = useState("");
  const [results, setResults] = useState<AdzunaResult[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = () => {
    setLoading(true);   // show "Searching..."
    setError(null);     // clear any old error message
    fetch(
      `http://localhost:3001/adzuna/search?what=${encodeURIComponent(what)}&where=${encodeURIComponent(where)}`,
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Search failed (${response.status})`);
        }
        return response.json();
      })
      .then((data) => {
        setResults(data);
        setSelected([]);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const toggle = (externalId: string) => {
    if (selected.includes(externalId)) {
      setSelected(selected.filter((id) => id !== externalId));
    } else {
      setSelected([...selected, externalId]);
    }
  };



  const importSelected = () => {
    const picked = results.filter((result) => selected.includes(result.external_id));
    fetch("http://localhost:3001/opportunities/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ opportunities: picked }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Import failed (${response.status})`);
        }
        onImported();   // tell App: done, go back and reload the table
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  return (
    <div className="add-page">
      <h1>Import from Adzuna</h1>

      {/* Search boxes */}
      <div className="add-form">
        <label>Keywords</label>
        <input
          type="text"
          placeholder="e.g. software intern"
          value={what}
          onChange={(event) => setWhat(event.target.value)}
        />
        <label>Location (optional)</label>
        <input
          type="text"
          placeholder="e.g. London"
          value={where}
          onChange={(event) => setWhere(event.target.value)}
        />
        <button onClick={search} disabled={what === "" || loading}>
          Search
        </button>
      </div>

      {/* Status messages */}
      {loading && <p>Searching...</p>}
      {error && <p className="error">{error}</p>}

      {/* Results list */}
      <ul className="results-list">
        {results.map((result) => (
          <li key={result.external_id}>
            <label>
              <input
                type="checkbox"
                checked={selected.includes(result.external_id)}
                onChange={() => toggle(result.external_id)}
              />
              <strong>{result.title}</strong>
            </label>
            <div>
              {result.type} · {result.location ?? "Location not stated"} · Posted{" "}
              {result.posted_date ?? "unknown"} ·{" "}
              <a href={result.url} target="_blank" rel="noreferrer">
                View advert
              </a>
            </div>
          </li>
        ))}
      </ul>

      {/* STEP 8: Adzuna's terms say we must credit them */}
      <p>
        <a href="https://www.adzuna.co.uk" target="_blank" rel="noreferrer">
          Jobs by Adzuna
        </a>
      </p>

      <div className="form-buttons">
        <button onClick={onBack}>Back</button>
        <button onClick={importSelected} disabled={selected.length === 0}>
          Import selected ({selected.length})
        </button>
      </div>
    </div>
  );

export default ImportAdzuna;
