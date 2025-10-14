import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  const handleIncrement = () => {
    setCount((value) => value + 1);
  };

  const handleReset = () => {
    setCount(0);
  };

  return (
    <div className="app-shell">
      <header className="hero-banner">
        <h1 className="hero-title">Application Restored</h1>
        <p className="hero-subtitle">
          The development environment is back on track. Use the interactive counter to
          confirm everything is working as expected.
        </p>
      </header>
      <main className="content-sections">
        <section className="status-panel" aria-live="polite">
          <h2 className="panel-heading">Interactive Counter</h2>
          <p className="panel-description">
            Every click updates the state instantly, demonstrating a live React render
            cycle.
          </p>
          <div className="counter-value" role="status" aria-label="Counter value">
            {count}
          </div>
          <div className="panel-actions">
            <button className="action-button" type="button" onClick={handleIncrement}>
              Increase
            </button>
            <button className="secondary-button" type="button" onClick={handleReset}>
              Reset
            </button>
          </div>
        </section>
      </main>
      <footer className="app-footer">
        <p className="footer-copy">Everything is ready for development.</p>
      </footer>
    </div>
  );
}

export default App;
