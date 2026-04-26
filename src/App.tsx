import { useEffect, useMemo, useState } from "react";
import {
  AppState,
  DayPlan,
  DayRecord,
  ENVIRONMENT_OPTIONS,
  Tab,
} from "./types";
import {
  computeComebackScore,
  computeStreak,
  daysBetween,
  getOrCreateDay,
  loadState,
  saveState,
  todayISO,
} from "./storage";

function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [tab, setTab] = useState<Tab>("today");
  const [slippingOpen, setSlippingOpen] = useState(false);

  const today = todayISO();
  const todayRecord = useMemo(
    () => getOrCreateDay(state, today),
    [state, today]
  );

  useEffect(() => {
    saveState(state);
  }, [state]);

  const dayNumber = Math.min(365, daysBetween(state.startDate, today) + 1);
  const streak = useMemo(() => computeStreak(state), [state]);
  const proofScore = useMemo(
    () => computeComebackScore(todayRecord),
    [todayRecord]
  );

  function updateToday(updater: (d: DayRecord) => DayRecord) {
    setState((s) => {
      const current = getOrCreateDay(s, today);
      const next = updater(current);
      return { ...s, days: { ...s.days, [today]: next } };
    });
  }

  function setTomorrowPlan(plan: DayPlan) {
    setState((s) => ({ ...s, tomorrowPlan: plan }));
  }

  function adoptTomorrowPlan() {
    if (!state.tomorrowPlan) return;
    setState((s) => {
      const current = getOrCreateDay(s, today);
      const next: DayRecord = {
        ...current,
        plan: s.tomorrowPlan ?? current.plan,
      };
      return {
        ...s,
        days: { ...s.days, [today]: next },
        tomorrowPlan: null,
      };
    });
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">1</span>
          <div className="brand-text">
            <div className="brand-name">1year1life</div>
            <div className="brand-tag">365-day proof system</div>
          </div>
        </div>
        <div className="day-pill">
          Day <strong>{dayNumber}</strong> / 365
        </div>
      </header>

      <main className="content">
        {tab === "today" && (
          <TodayView
            record={todayRecord}
            update={updateToday}
            proofScore={proofScore}
            streak={streak}
            tomorrowPlan={state.tomorrowPlan}
            onAdoptPlan={adoptTomorrowPlan}
            onOpenSlipping={() => setSlippingOpen(true)}
          />
        )}
        {tab === "tomorrow" && (
          <TomorrowView
            plan={state.tomorrowPlan}
            setPlan={setTomorrowPlan}
          />
        )}
        {tab === "journal" && (
          <JournalView record={todayRecord} update={updateToday} />
        )}
        {tab === "progress" && (
          <ProgressView state={state} dayNumber={dayNumber} streak={streak} />
        )}
      </main>

      {slippingOpen && (
        <SlippingModal
          onClose={() => setSlippingOpen(false)}
          onRecover={() => {
            updateToday((d) => ({ ...d, slippedAndRecovered: true }));
            setSlippingOpen(false);
          }}
        />
      )}

      <button
        className="slipping-fab"
        onClick={() => setSlippingOpen(true)}
        aria-label="I'm slipping"
        title="I'm slipping"
      >
        I'm slipping
      </button>

      <nav className="tabbar">
        <TabButton label="Today" active={tab === "today"} onClick={() => setTab("today")} />
        <TabButton label="Tomorrow" active={tab === "tomorrow"} onClick={() => setTab("tomorrow")} />
        <TabButton label="Journal" active={tab === "journal"} onClick={() => setTab("journal")} />
        <TabButton label="Progress" active={tab === "progress"} onClick={() => setTab("progress")} />
      </nav>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`tab ${active ? "tab-active" : ""}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function TodayView({
  record,
  update,
  proofScore,
  streak,
  tomorrowPlan,
  onAdoptPlan,
  onOpenSlipping,
}: {
  record: DayRecord;
  update: (u: (d: DayRecord) => DayRecord) => void;
  proofScore: number;
  streak: number;
  tomorrowPlan: DayPlan | null;
  onAdoptPlan: () => void;
  onOpenSlipping: () => void;
}) {
  const planEmpty =
    !record.plan.nonNegotiables[0] && !record.plan.nonNegotiables[1];

  return (
    <div className="view">
      <section className="card hero-card">
        <span className="kicker">Proof Score</span>
        <div className="hero-row">
          <div>
            <div className="score">
              {proofScore}
              <span className="score-suffix">/100</span>
            </div>
          </div>
          <div className="hero-meta">
            <div className="muted small">Streak</div>
            <div className="strong">{streak} days</div>
          </div>
        </div>
        <div className="score-bar">
          <div className="score-bar-fill" style={{ width: `${proofScore}%` }} />
        </div>
      </section>

      {planEmpty && tomorrowPlan && (
        <section className="card accent-card">
          <span className="kicker">Last night you planned today</span>
          <h3>Pull in your plan</h3>
          <p className="muted">
            You decided tomorrow's proof last night. Pull it into today and start strong.
          </p>
          <button className="btn primary" onClick={onAdoptPlan}>
            Use last night's plan
          </button>
        </section>
      )}

      <section className="card">
        <span className="kicker">Prove the Day</span>
        <h3>Two non-negotiables</h3>
        <p className="muted small">
          Two non-negotiables. One day. No hiding.
        </p>
        <input
          className="input"
          placeholder="Non-negotiable #1"
          value={record.plan.nonNegotiables[0]}
          onChange={(e) =>
            update((d) => ({
              ...d,
              plan: {
                ...d.plan,
                nonNegotiables: [e.target.value, d.plan.nonNegotiables[1]],
              },
            }))
          }
        />
        <input
          className="input"
          placeholder="Non-negotiable #2"
          value={record.plan.nonNegotiables[1]}
          onChange={(e) =>
            update((d) => ({
              ...d,
              plan: {
                ...d.plan,
                nonNegotiables: [d.plan.nonNegotiables[0], e.target.value],
              },
            }))
          }
        />
      </section>

      <section className="card">
        <span className="kicker">Morning Launch</span>
        <h3>Start with proof, not noise</h3>
        <CheckRow
          label="Water"
          checked={record.morning.water}
          onChange={(v) => update((d) => ({ ...d, morning: { ...d.morning, water: v } }))}
        />
        <CheckRow
          label="Movement"
          checked={record.morning.movement}
          onChange={(v) => update((d) => ({ ...d, morning: { ...d.morning, movement: v } }))}
        />
        <CheckRow
          label="Reflection"
          checked={record.morning.reflection}
          onChange={(v) => update((d) => ({ ...d, morning: { ...d.morning, reflection: v } }))}
        />
        <CheckRow
          label="First focus block"
          checked={record.morning.focusBlock}
          onChange={(v) => update((d) => ({ ...d, morning: { ...d.morning, focusBlock: v } }))}
        />
        <CheckRow
          label="No social before proof"
          checked={record.morning.noSocialBeforeProof}
          onChange={(v) =>
            update((d) => ({
              ...d,
              morning: { ...d.morning, noSocialBeforeProof: v },
            }))
          }
        />
      </section>

      <section className="card">
        <span className="kicker">Daily Proof Protocol</span>
        <h3>Did you show up?</h3>
        <p className="muted small">
          {record.plan.proofDefinition || "Mark each non-negotiable as proof. One day at a time."}
        </p>
        <CheckRow
          label={record.plan.nonNegotiables[0] || "Proof #1"}
          checked={record.proof.proofOne}
          onChange={(v) => update((d) => ({ ...d, proof: { ...d.proof, proofOne: v } }))}
        />
        <CheckRow
          label={record.plan.nonNegotiables[1] || "Proof #2"}
          checked={record.proof.proofTwo}
          onChange={(v) => update((d) => ({ ...d, proof: { ...d.proof, proofTwo: v } }))}
        />
        <textarea
          className="textarea"
          placeholder="Notes on today's proof..."
          value={record.proof.notes}
          onChange={(e) =>
            update((d) => ({ ...d, proof: { ...d.proof, notes: e.target.value } }))
          }
        />
      </section>

      <section className="card danger-card">
        <span className="kicker" style={{ color: "var(--danger)" }}>Comeback Ladder</span>
        <h3>Slipping?</h3>
        <p className="muted small">
          One missed day must not become a pattern. Tap below for the rescue protocol.
        </p>
        <button className="btn danger" onClick={onOpenSlipping}>
          I'm slipping — rescue me
        </button>
      </section>
    </div>
  );
}

function TomorrowView({
  plan,
  setPlan,
}: {
  plan: DayPlan | null;
  setPlan: (p: DayPlan) => void;
}) {
  const current: DayPlan = plan ?? {
    nonNegotiables: ["", ""],
    derailers: "",
    proofDefinition: "",
    environmentSetup: [],
  };

  function update(patch: Partial<DayPlan>) {
    setPlan({ ...current, ...patch });
  }

  function toggleEnv(item: string) {
    const has = current.environmentSetup.includes(item);
    update({
      environmentSetup: has
        ? current.environmentSetup.filter((i) => i !== item)
        : [...current.environmentSetup, item],
    });
  }

  return (
    <div className="view">
      <section className="card">
        <span className="kicker">Night-Before Plan</span>
        <h3>Plan tomorrow before tomorrow starts</h3>
        <p className="muted small">
          If you wake up without a plan, the world gives you one.
        </p>
      </section>

      <section className="card">
        <h3>Two non-negotiables</h3>
        <input
          className="input"
          placeholder="Tomorrow's non-negotiable #1"
          value={current.nonNegotiables[0]}
          onChange={(e) =>
            update({ nonNegotiables: [e.target.value, current.nonNegotiables[1]] })
          }
        />
        <input
          className="input"
          placeholder="Tomorrow's non-negotiable #2"
          value={current.nonNegotiables[1]}
          onChange={(e) =>
            update({ nonNegotiables: [current.nonNegotiables[0], e.target.value] })
          }
        />
      </section>

      <section className="card">
        <h3>What could derail you?</h3>
        <textarea
          className="textarea"
          placeholder="Triggers, distractions, weak moments..."
          value={current.derailers}
          onChange={(e) => update({ derailers: e.target.value })}
        />
      </section>

      <section className="card">
        <h3>What counts as proof?</h3>
        <textarea
          className="textarea"
          placeholder="Define what showing up looks like tomorrow..."
          value={current.proofDefinition}
          onChange={(e) => update({ proofDefinition: e.target.value })}
        />
      </section>

      <section className="card">
        <span className="kicker">Environment Stack</span>
        <h3>Make the right choice the easy choice</h3>
        {ENVIRONMENT_OPTIONS.map((opt) => (
          <CheckRow
            key={opt}
            label={opt}
            checked={current.environmentSetup.includes(opt)}
            onChange={() => toggleEnv(opt)}
          />
        ))}
      </section>
    </div>
  );
}

function JournalView({
  record,
  update,
}: {
  record: DayRecord;
  update: (u: (d: DayRecord) => DayRecord) => void;
}) {
  return (
    <div className="view">
      <section className="card">
        <span className="kicker">Morning</span>
        <h3>Clear the mind</h3>
        <textarea
          className="textarea tall"
          placeholder="What's on your mind? What matters today?"
          value={record.reflection.morning}
          onChange={(e) =>
            update((d) => ({
              ...d,
              reflection: { ...d.reflection, morning: e.target.value },
            }))
          }
        />
      </section>

      <section className="card">
        <span className="kicker">Evening</span>
        <h3>Document the day</h3>
        <textarea
          className="textarea tall"
          placeholder="How did the day go? What did you do? What was real?"
          value={record.reflection.evening}
          onChange={(e) =>
            update((d) => ({
              ...d,
              reflection: { ...d.reflection, evening: e.target.value },
            }))
          }
        />
      </section>

      <section className="card">
        <span className="kicker">Lesson</span>
        <h3>What did I learn today?</h3>
        <textarea
          className="textarea"
          placeholder="One lesson. One sentence is enough."
          value={record.reflection.learned}
          onChange={(e) =>
            update((d) => ({
              ...d,
              reflection: { ...d.reflection, learned: e.target.value },
            }))
          }
        />
      </section>

      <section className="card">
        <span className="kicker">Setback Journal</span>
        <h3>Where did failure expose something?</h3>
        <textarea
          className="textarea"
          placeholder="What broke? What must change?"
          value={record.reflection.setback}
          onChange={(e) =>
            update((d) => ({
              ...d,
              reflection: { ...d.reflection, setback: e.target.value },
            }))
          }
        />
      </section>
    </div>
  );
}

function ProgressView({
  state,
  dayNumber,
  streak,
}: {
  state: AppState;
  dayNumber: number;
  streak: number;
}) {
  const records = Object.values(state.days).sort((a, b) =>
    a.date < b.date ? 1 : -1
  );
  const proofDays = records.filter(
    (r) => r.proof.proofOne || r.proof.proofTwo
  ).length;
  const recoveries = records.filter((r) => r.slippedAndRecovered).length;
  const totalScore = records.reduce(
    (sum, r) => sum + computeComebackScore(r),
    0
  );
  const avgScore = records.length ? Math.round(totalScore / records.length) : 0;

  // Last 7 days
  const last7 = records.slice(0, 7).reverse();

  return (
    <div className="view">
      <section className="card">
        <span className="kicker">The 365 Framework</span>
        <h3>One year. One life.</h3>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${(dayNumber / 365) * 100}%` }}
          />
        </div>
        <div className="muted small">
          {dayNumber} / 365 — {365 - dayNumber} days to go
        </div>
      </section>

      <section className="card">
        <h3>Stats</h3>
        <div className="stat-grid">
          <Stat label="Streak" value={`${streak}`} sub="days" />
          <Stat label="Proof days" value={`${proofDays}`} sub="logged" />
          <Stat label="Comebacks" value={`${recoveries}`} sub="recoveries" />
          <Stat label="Avg. score" value={`${avgScore}`} sub="of 100" />
        </div>
      </section>

      <section className="card">
        <h3>Last 7 days</h3>
        {last7.length === 0 && (
          <p className="muted small">No history yet — show up today.</p>
        )}
        {last7.length > 0 && (
          <div className="bars">
            {last7.map((r) => {
              const s = computeComebackScore(r);
              return (
                <div className="bar-col" key={r.date}>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ height: `${s}%` }} />
                  </div>
                  <div className="bar-label">{r.date.slice(5)}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="card">
        <span className="kicker">Weekly Review</span>
        <h3>What worked. What broke. What's next.</h3>
        <ul className="review-list">
          <li>
            Proof days this week:{" "}
            <strong>
              {last7.filter((r) => r.proof.proofOne || r.proof.proofTwo).length}
            </strong>
          </li>
          <li>
            Recoveries this week:{" "}
            <strong>{last7.filter((r) => r.slippedAndRecovered).length}</strong>
          </li>
          <li>
            Best day score:{" "}
            <strong>
              {last7.reduce(
                (m, r) => Math.max(m, computeComebackScore(r)),
                0
              )}
            </strong>
          </li>
        </ul>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="stat">
      <div className="muted small">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="muted small">{sub}</div>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={`check-row ${checked ? "checked" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="check-box" aria-hidden="true">
        {checked ? "✓" : ""}
      </span>
      <span className="check-label">{label}</span>
    </label>
  );
}

function SlippingModal({
  onClose,
  onRecover,
}: {
  onClose: () => void;
  onRecover: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <span className="kicker" style={{ color: "var(--danger)" }}>
          Comeback Ladder
        </span>
        <h3>Rescue Protocol</h3>
        <p className="muted">
          Don't wait for Monday. Reset the day with one tiny act of proof.
        </p>
        <ol className="rescue-list">
          <li>Do 10 minutes — anything that counts as movement.</li>
          <li>Log one honest sentence about where you are.</li>
          <li>Complete one tiny proof action.</li>
          <li>Reset the day. Continue.</li>
        </ol>
        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>
            Close
          </button>
          <button className="btn primary" onClick={onRecover}>
            I recovered — log it
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
