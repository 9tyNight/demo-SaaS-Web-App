import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const organizations = [
  {
    id: "firm-a",
    name: "Architecture Firm A",
    plan: "Enterprise",
    region: "US-East",
    projects: 18,
    findingsResolved: "91%",
  },
  {
    id: "global-builders",
    name: "Global Builders Corp",
    plan: "Business",
    region: "EU-Central",
    projects: 42,
    findingsResolved: "86%",
  },
  {
    id: "northline",
    name: "Northline Design Studio",
    plan: "Pilot",
    region: "AP-Southeast",
    projects: 7,
    findingsResolved: "78%",
  },
];

const findingsByOrg = {
  "firm-a": [
    {
      severity: "Error",
      title: "Fire exit corridor width violates Section 10.2",
      location: "Level 02 - East Wing",
      detail:
        "Detected corridor clearance of 940 mm where the configured IBC rule pack requires 1,100 mm minimum egress width.",
      confidence: 97,
      assignee: "Life Safety",
    },
    {
      severity: "Warning",
      title: "Structural column alignment variance",
      location: "Grid C4 to C7",
      detail:
        "Column centerlines vary by 52 mm between stacked floors. Recommend engineer review before issue-for-construction.",
      confidence: 91,
      assignee: "Structural",
    },
    {
      severity: "Info",
      title: "Accessible restroom turning radius verified",
      location: "Level 01 - Core",
      detail:
        "The Python engine found compliant 1,520 mm turning clearance and door swing separation in the submitted plan.",
      confidence: 99,
      assignee: "QA",
    },
  ],
  "global-builders": [
    {
      severity: "Error",
      title: "Stair pressurization shaft missing smoke control tag",
      location: "Tower B - Stair 03",
      detail:
        "The plan references a pressurization shaft, but no matching mechanical smoke control annotation was detected.",
      confidence: 94,
      assignee: "MEP",
    },
    {
      severity: "Warning",
      title: "Door swing conflicts with equipment clearance",
      location: "Basement - Electrical Room",
      detail:
        "Door arc intersects required service clearance for panel E-17. Suggested remediation: reverse swing or shift panel bank.",
      confidence: 88,
      assignee: "Electrical",
    },
    {
      severity: "Warning",
      title: "Travel distance approaching local code threshold",
      location: "Podium Retail",
      detail:
        "Longest measured path is 44.3 m against a 45 m rule. Flagged for reviewer attention due to tolerance settings.",
      confidence: 85,
      assignee: "Code Review",
    },
  ],
  northline: [
    {
      severity: "Error",
      title: "Ramp slope exceeds accessibility requirement",
      location: "Lobby Entry",
      detail:
        "Measured ramp slope is 1:10.8. Current tenant rule pack requires 1:12 or flatter for accessible routes.",
      confidence: 96,
      assignee: "Accessibility",
    },
    {
      severity: "Warning",
      title: "Fire-rated wall label missing at corridor junction",
      location: "Level 03 - South Corridor",
      detail:
        "Wall type appears fire-rated from surrounding assemblies, but the explicit rating callout is absent in the PDF layer.",
      confidence: 87,
      assignee: "Architecture",
    },
    {
      severity: "Info",
      title: "Parking bay dimensions passed tenant rule pack",
      location: "Site Plan - Zone P2",
      detail:
        "Standard and accessible bay dimensions match the organization's configured municipal review profile.",
      confidence: 98,
      assignee: "Planning",
    },
  ],
};

const severityStyles = {
  Error: {
    pill: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-500",
    border: "border-rose-200",
  },
  Warning: {
    pill: "bg-amber-50 text-amber-800 ring-amber-200",
    dot: "bg-amber-500",
    border: "border-amber-200",
  },
  Info: {
    pill: "bg-sky-50 text-sky-700 ring-sky-200",
    dot: "bg-sky-500",
    border: "border-sky-200",
  },
};

function App() {
  const [organizationId, setOrganizationId] = useState(organizations[0].id);
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobState, setJobState] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [activeFinding, setActiveFinding] = useState(0);
  const inputRef = useRef(null);

  const organization = useMemo(
    () => organizations.find((item) => item.id === organizationId),
    [organizationId],
  );

  const findings = findingsByOrg[organizationId];
  const isProcessing = jobState === "processing";
  const isComplete = jobState === "complete";

  useEffect(() => {
    setSelectedFile(null);
    setJobState("idle");
    setProgress(0);
    setActiveFinding(0);
  }, [organizationId]);

  useEffect(() => {
    if (!isProcessing) return undefined;

    const startedAt = Date.now();
    const duration = 5000;
    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(nextProgress);
    }, 120);

    const timeoutId = window.setTimeout(() => {
      setProgress(100);
      setJobState("complete");
    }, duration);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [isProcessing]);

  function startJob(file) {
    if (!file) return;
    setSelectedFile(file);
    setJobState("processing");
    setProgress(5);
    setActiveFinding(0);
  }

  function handleFileChange(event) {
    startJob(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    startJob(event.dataTransfer.files?.[0]);
  }

  const errorCount = findings.filter((item) => item.severity === "Error").length;
  const warningCount = findings.filter((item) => item.severity === "Warning").length;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-0 top-40 h-[420px] w-[420px] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Python engine SaaS prototype
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Architectural compliance review workspace
            </h1>
          </div>

          <label className="flex w-full flex-col gap-2 md:w-80">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Tenant context
            </span>
            <select
              value={organizationId}
              onChange={(event) => setOrganizationId(event.target.value)}
              className="h-12 rounded-xl border border-white/10 bg-slate-900 px-4 text-sm font-semibold text-white outline-none ring-cyan-400/0 transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-400/15"
            >
              {organizations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </header>

        <div className="grid flex-1 gap-5 py-5 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">Active organization</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">{organization.name}</h2>
              </div>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-300/20">
                Isolated tenant
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                ["Plan", organization.plan],
                ["Region", organization.region],
                ["Projects", organization.projects],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 text-lg font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className="mt-6 flex min-h-72 w-full flex-col items-center justify-center rounded-3xl border border-dashed border-cyan-300/40 bg-cyan-300/[0.06] px-6 text-center transition hover:border-cyan-200 hover:bg-cyan-300/[0.09] focus:outline-none focus:ring-4 focus:ring-cyan-300/20"
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-black text-slate-950 shadow-xl shadow-cyan-950/20">
                PDF
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">
                Upload architectural blueprint
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                Drag a PDF here or click to select a file. The prototype then simulates dispatching it to a Celery and Redis backed Python analysis queue.
              </p>
              {selectedFile && (
                <div className="mt-5 rounded-full bg-slate-950/70 px-4 py-2 text-sm font-medium text-cyan-200 ring-1 ring-white/10">
                  {selectedFile.name}
                </div>
              )}
            </button>

            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Processing PDF via Python Engine...
                  </p>
                  <p className="text-xs text-slate-500">
                    Queue status: {isProcessing ? "worker running" : isComplete ? "analysis complete" : "waiting for upload"}
                  </p>
                </div>
                {isProcessing && (
                  <div className="h-9 w-9 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
                )}
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>Tenant-scoped job ID: {organizationId.toUpperCase()}-PDF-0924</span>
                <span>{progress}%</span>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-5">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Critical errors", errorCount, "text-rose-300"],
                ["Warnings", warningCount, "text-amber-300"],
                ["Resolved trend", organization.findingsResolved, "text-emerald-300"],
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-xl shadow-black/10">
                  <p className="text-sm text-slate-400">{label}</p>
                  <p className={`mt-2 text-3xl font-semibold ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="flex-1 rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm text-slate-400">Compliance findings</p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">
                    {isComplete ? "Python engine results" : "Results appear after processing"}
                  </h2>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10">
                  {isComplete ? `${findings.length} findings detected` : "5 second queue simulation"}
                </span>
              </div>

              {!isComplete ? (
                <div className="mt-6 flex min-h-[420px] items-center justify-center rounded-3xl border border-white/10 bg-slate-950/40 p-8 text-center">
                  <div>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-xl font-black text-cyan-200 ring-1 ring-white/10">
                      AI
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-white">
                      Upload a blueprint to launch analysis
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                      The empty state keeps the workflow honest: findings are scoped to the selected organization and only appear after the async worker completes.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                  <div className="space-y-3">
                    {findings.map((finding, index) => {
                      const styles = severityStyles[finding.severity];
                      const selected = activeFinding === index;
                      return (
                        <button
                          key={finding.title}
                          type="button"
                          onClick={() => setActiveFinding(index)}
                          className={`w-full rounded-2xl border bg-slate-950/50 p-4 text-left transition ${
                            selected
                              ? `${styles.border} ring-4 ring-white/10`
                              : "border-white/10 hover:border-white/25"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${styles.pill}`}>
                              {finding.severity}
                            </span>
                          </div>
                          <p className="mt-3 font-semibold text-white">{finding.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{finding.location}</p>
                        </button>
                      );
                    })}
                  </div>

                  <article className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                          severityStyles[findings[activeFinding].severity].pill
                        }`}
                      >
                        {findings[activeFinding].severity}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        Confidence {findings[activeFinding].confidence}%
                      </span>
                    </div>
                    <h3 className="mt-4 text-2xl font-semibold leading-tight text-white">
                      {findings[activeFinding].title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {findings[activeFinding].detail}
                    </p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-xs text-slate-500">Location</p>
                        <p className="mt-1 font-semibold text-white">{findings[activeFinding].location}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-xs text-slate-500">Routed to</p>
                        <p className="mt-1 font-semibold text-white">{findings[activeFinding].assignee}</p>
                      </div>
                    </div>
                    <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                      <p className="text-sm font-semibold text-cyan-100">Suggested next action</p>
                      <p className="mt-1 text-sm leading-6 text-cyan-100/75">
                        Create a reviewer task, attach the source PDF coordinates, and sync the decision back to the tenant audit log.
                      </p>
                    </div>
                  </article>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
