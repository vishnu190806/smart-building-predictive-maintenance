import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { API_BASE_URL } from "./constants";
import "./App.css";

/**
 * TYPES
 */
type ModelMode = "unsupervised" | "supervised";

interface AnomalyPoint {
  timestamp: number;
  score: number;
  isAnomaly: number;
  assetId: string;
}

interface Asset {
  id: string;
  name: string;
  probeId: string;
  icon: string;
  // Sensor states per asset
  rotationalSpeed: number;
  processTemperature: number;
  torque: number;
  toolWear: number;
  // Prediction results per asset
  isAnomaly: boolean | null;
  anomalyScore: number | null;
  failureProbability: number | null;
  lastChecked: string;
  lastCheckedISO: string | null;
  // NEW: Cluster fields
  clusterId: number | null;
  clusterName: string | null;
  clusterConfidence: number | null;
  clusterRecommendation: string | null;
}

const MAX_HISTORY = 40;

const INITIAL_ASSETS: Asset[] = [
  {
    id: "hvac",
    name: "HVAC Unit A",
    probeId: "#A1-99",
    icon: "❄️",
    rotationalSpeed: 1500,
    processTemperature: 305,
    torque: 40,
    toolWear: 0,
    isAnomaly: null,
    anomalyScore: null,
    failureProbability: null,
    lastChecked: "Never",
    lastCheckedISO: null,
    clusterId: null,
    clusterName: null,
    clusterConfidence: null,
    clusterRecommendation: null,
  },
  {
    id: "pump",
    name: "Chilled Water Pump",
    probeId: "#P2-42",
    icon: "💧",
    rotationalSpeed: 1200,
    processTemperature: 300,
    torque: 35,
    toolWear: 10,
    isAnomaly: null,
    anomalyScore: null,
    failureProbability: null,
    lastChecked: "Never",
    lastCheckedISO: null,
    clusterId: null,
    clusterName: null,
    clusterConfidence: null,
    clusterRecommendation: null,
  },
  {
    id: "fan",
    name: "Supply Fan Cluster",
    probeId: "#F9-12",
    icon: "🌀",
    rotationalSpeed: 1800,
    processTemperature: 310,
    torque: 25,
    toolWear: 50,
    isAnomaly: null,
    anomalyScore: null,
    failureProbability: null,
    lastChecked: "Never",
    lastCheckedISO: null,
    clusterId: null,
    clusterName: null,
    clusterConfidence: null,
    clusterRecommendation: null,
  },
];

/**
 * HELPERS
 */
function mapScoreToRisk(modelMode: ModelMode, score: number | null): number {
  if (score == null) return 0;
  if (modelMode === "supervised") return Math.round(score * 100); // probability

  // IsolationForest: higher score = more normal. Map to 0–100 risk.
  const clamped = Math.max(-0.5, Math.min(0.5, score));
  const normalized = (0.5 - clamped) / 1.0;
  return Math.round(normalized * 100);
}

function getInsight(isAnomaly: boolean | null, risk: number): string {
  if (isAnomaly === null)
    return "Awaiting analysis. Adjust telemetry and run a health scan.";
  if (!isAnomaly && risk < 30)
    return "Operating within normal envelope. No immediate maintenance required.";
  if (!isAnomaly && risk < 60)
    return "Slight deviation detected. Consider scheduling routine inspection soon.";
  return "Elevated risk of failure. Recommend targeted inspection and load reduction.";
}

function formatDisplayTime(isoString: string | null): string {
  if (!isoString) return "Never";
  const date = new Date(isoString);
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${time} - Today`;
}

/**
 * SUB-COMPONENTS
 */
interface HealthMetricsStripProps {
  isAnomaly: boolean | null;
  riskPercent: number;
  lastCheckedISO: string | null;
}

const HealthMetricsStrip: React.FC<HealthMetricsStripProps> = ({
  isAnomaly,
  riskPercent,
  lastCheckedISO,
}) => {
  if (isAnomaly === null) return null;

  const statusText = isAnomaly ? "At risk" : "Healthy";
  const statusColor = isAnomaly ? "var(--accent-red)" : "var(--accent-green)";

  let riskColor = "var(--accent-green)";
  if (riskPercent >= 60) riskColor = "var(--accent-red)";
  else if (riskPercent >= 30) riskColor = "var(--accent-orange)";

  return (
    <div className="metrics-strip glass-panel-compact">
      <div className="metric-item">
        <span className="metric-label">Health status</span>
        <span
          className="metric-value status-pill-text"
          style={{
            color: statusColor,
            textShadow: `0 0 10px ${statusColor}44`,
          }}
        >
          {statusText}
        </span>
      </div>
      <div className="metric-item">
        <span className="metric-label">Risk score</span>
        <span className="metric-value" style={{ color: riskColor }}>
          {riskPercent}%
        </span>
      </div>
      <div className="metric-item">
        <span className="metric-label">Last checked</span>
        <span className="metric-value time-stamp">
          {formatDisplayTime(lastCheckedISO)}
        </span>
      </div>
    </div>
  );
};

interface SystemInsightProps {
  isAnomaly: boolean | null;
  riskPercent: number;
}

const SystemInsight: React.FC<SystemInsightProps> = ({
  isAnomaly,
  riskPercent,
}) => {
  if (isAnomaly === null) return null;

  const insightText = getInsight(isAnomaly, riskPercent);
  const isHighRisk = isAnomaly || riskPercent >= 60;

  return (
    <div
      className={`system-insight-block ${
        isHighRisk ? "warning-insight" : "info-insight"
      }`}
    >
      <div className="insight-header">
        <div className="insight-icon">
          {isHighRisk ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          )}
        </div>
        <span>System insight</span>
      </div>
      <p className="insight-body">{insightText}</p>
    </div>
  );
};

// NEW: Cluster Visualization Component
interface ClusterVisualizationProps {
  clusterId: number | null;
  clusterName: string | null;
  clusterConfidence: number | null;
  clusterRecommendation: string | null;
}

const ClusterVisualization: React.FC<ClusterVisualizationProps> = ({
  clusterId,
  clusterName,
  clusterConfidence,
  clusterRecommendation,
}) => {
  if (clusterId === null || !clusterName) return null;

  const clusterColors = ["#FF6B6B", "#FFA500", "#FFD700", "#4ECDC4"];
  const backgroundColor = clusterColors[clusterId % 4];

  return (
    <div className="cluster-visualization" style={{ marginTop: "20px" }}>
      <h4 style={{ margin: "0 0 15px 0", fontSize: "1rem", fontWeight: 600 }}>
        🧠 Operating Mode Analysis
      </h4>

      <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
        {/* Cluster Badge */}
        <div
          style={{
            padding: "12px 20px",
            borderRadius: "20px",
            backgroundColor: backgroundColor,
            color: "white",
            fontWeight: "bold",
            fontSize: "16px",
            boxShadow: `0 4px 12px ${backgroundColor}44`,
            minWidth: "120px",
            textAlign: "center",
          }}
        >
          Cluster {clusterId}
        </div>

        {/* Cluster Name */}
        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: "0 0 5px 0",
              fontSize: "12px",
              color: "var(--text-secondary)",
            }}
          >
            Mode
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            {clusterName}
          </p>
        </div>

        {/* Confidence */}
        <div style={{ textAlign: "right" }}>
          <p
            style={{
              margin: "0 0 5px 0",
              fontSize: "12px",
              color: "var(--text-secondary)",
            }}
          >
            Confidence
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 600,
              color: backgroundColor,
            }}
          >
            {clusterConfidence ? (clusterConfidence * 100).toFixed(0) : 0}%
          </p>
        </div>
      </div>

      {/* Recommendation Box */}
      {clusterRecommendation && (
        <div
          style={{
            padding: "12px 14px",
            backgroundColor: "#f8f9fa",
            border: `2px solid ${backgroundColor}44`,
            borderRadius: "8px",
            borderLeft: `4px solid ${backgroundColor}`,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              fontStyle: "italic",
              color: "var(--text-primary)",
            }}
          >
            💡 <strong>Recommendation:</strong> {clusterRecommendation}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * TOOLTIP & TOGGLE COMPONENTS
 */
const TooltipContent: React.FC<{ mode: ModelMode }> = ({ mode }) => {
  const isUnsupervised = mode === "unsupervised";
  return (
    <div className={`model-tooltip ${mode}`}>
      <h4 className="tooltip-title">
        {isUnsupervised
          ? "Anomaly Mode – IsolationForest"
          : "Failure Mode – RandomForest"}
      </h4>
      <p className="tooltip-subtitle">
        {isUnsupervised
          ? "Unsupervised learning - Trained on normal AI4I sensor data to detect unusual behavior."
          : "Supervised learning - Trained on AI4I labels to predict machine failure (0/1)."}
      </p>
    </div>
  );
};

interface ModelToggleProps {
  mode: ModelMode;
  onChange: (mode: ModelMode) => void;
}

const ModelToggle: React.FC<ModelToggleProps> = ({ mode, onChange }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const isSupervised = mode === "supervised";

  return (
    <div
      className="toggle-container"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="toggle-caption">ANALYSIS MODE</span>
      <div className="toggle-wrapper">
        <button
          type="button"
          onClick={() => onChange(isSupervised ? "unsupervised" : "supervised")}
          className={`model-toggle ${
            isSupervised ? "supervised" : "unsupervised"
          }`}
        >
          <div className="toggle-track">
            <span
              className={`toggle-label left ${!isSupervised ? "active" : ""}`}
            >
              Anomaly
            </span>
            <span
              className={`toggle-label right ${isSupervised ? "active" : ""}`}
            >
              Failure
            </span>
            <div className="toggle-thumb" />
          </div>
        </button>
        {showTooltip && <TooltipContent mode={mode} />}
      </div>
    </div>
  );
};

/**
 * MAIN APP
 */
const App: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [activeAssetId, setActiveAssetId] = useState<string>("hvac");
  const [modelMode, setModelMode] = useState<ModelMode>("unsupervised");
  const [apiStatus, setApiStatus] = useState<"connected" | "disconnected">(
    "disconnected"
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [anomalyHistory, setAnomalyHistory] = useState<AnomalyPoint[]>([]);
  const [assetGlow, setAssetGlow] = useState<"none" | "green" | "red">("none");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeAsset = useMemo(
    () => assets.find((a) => a.id === activeAssetId) || assets[0],
    [assets, activeAssetId]
  );

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) setApiStatus("connected");
        else setApiStatus("disconnected");
      } catch (e) {
        setApiStatus("disconnected");
      }
    };
    checkHealth();
  }, []);

  const updateActiveSensor = (
    key: keyof Pick<
      Asset,
      "rotationalSpeed" | "processTemperature" | "torque" | "toolWear"
    >,
    value: number
  ) => {
    setAssets((prev) =>
      prev.map((asset) =>
        asset.id === activeAssetId ? { ...asset, [key]: value } : asset
      )
    );
  };

  const handleAnalyze = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading) return;

      createRipple(event);
      setIsLoading(true);

      try {
        const modeQuery =
          modelMode === "unsupervised" ? "unsupervised" : "supervised";
        const response = await fetch(
          `${API_BASE_URL}/predict?mode=${modeQuery}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              "Rotational speed [rpm]": activeAsset.rotationalSpeed,
              "Process temperature [K]": activeAsset.processTemperature,
              "Torque [Nm]": activeAsset.torque,
              "Tool wear [min]": activeAsset.toolWear,
            }),
          }
        );

        if (!response.ok) throw new Error("API error");

        const data = await response.json();
        const nowISO = new Date().toISOString();
        const timeStr = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        setApiStatus("connected");
        const resultAnomaly = data.is_anomaly === 1;
        const resultScore = data.anomaly_score;

        setAssets((prev) =>
          prev.map((a) =>
            a.id === activeAssetId
              ? {
                  ...a,
                  isAnomaly: resultAnomaly,
                  anomalyScore: resultScore,
                  failureProbability:
                    modelMode === "supervised"
                      ? resultScore
                      : a.failureProbability,
                  lastChecked: timeStr,
                  lastCheckedISO: nowISO,
                  // NEW: Cluster fields from API response
                  clusterId: data.operating_mode_cluster ?? null,
                  clusterName: data.cluster_name ?? null,
                  clusterConfidence: data.cluster_confidence ?? null,
                  clusterRecommendation:
                    data.cluster_recommendations?.[0] ?? null,
                }
              : a
          )
        );

        setAnomalyHistory((prev) => {
          const newPoint = {
            timestamp: Date.now(),
            score: resultScore,
            isAnomaly: resultAnomaly ? 1 : 0,
            assetId: activeAssetId,
          };
          return [...prev, newPoint].slice(-MAX_HISTORY);
        });

        setAssetGlow(resultAnomaly ? "red" : "green");
        setTimeout(() => setAssetGlow("none"), 2000);
      } catch (e) {
        setApiStatus("disconnected");
        alert("Analysis engine offline. Check server connection.");
      } finally {
        setIsLoading(false);
      }
    },
    [activeAsset, isLoading, activeAssetId, modelMode]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const pad = 15;

    ctx.clearRect(0, 0, w, h);
    const currentAssetHistory = anomalyHistory.filter(
      (h) => h.assetId === activeAssetId
    );
    if (currentAssetHistory.length < 2) return;

    const scores = currentAssetHistory.map((d) => d.score);
    const minVal = Math.min(-0.2, ...scores);
    const maxVal = Math.max(0.8, ...scores);
    const range = maxVal - minVal;

    const getX = (i: number) =>
      pad + (i / (currentAssetHistory.length - 1)) * (w - pad * 2);
    const getY = (val: number) =>
      h - pad - ((val - minVal) / (range || 1)) * (h - pad * 2);

    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    currentAssetHistory.forEach((p, i) => {
      const x = getX(i);
      const y = getY(p.score);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    const lastPoint = currentAssetHistory[currentAssetHistory.length - 1];
    ctx.strokeStyle = lastPoint.isAnomaly ? "#ef4444" : "#10b981";
    ctx.stroke();
  }, [anomalyHistory, activeAssetId]);

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const bRect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - bRect.left - radius}px`;
    circle.style.top = `${event.clientY - bRect.top - radius}px`;
    circle.classList.add("ripple");
    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) ripple.remove();
    button.appendChild(circle);
  };

  const currentRisk = useMemo(
    () => mapScoreToRisk(modelMode, activeAsset.anomalyScore),
    [modelMode, activeAsset.anomalyScore]
  );

  return (
    <div className="app-root">
      <div className="orb-container">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="app-container">
        <header>
          <div className="logo-section">
            <div className="logo-icon">
              <svg
                className="logo-glyph"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M4 11.5L12 4l8 7.5v7a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 18.5v-7z"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="logo-text">Aurora Building Health</div>
          </div>

          <div className="header-actions">
            <ModelToggle mode={modelMode} onChange={setModelMode} />
            <div className={`api-pill ${apiStatus}`}>
              <div className="status-dot"></div>
              <span>
                {apiStatus === "connected"
                  ? "SYSTEM CONNECTED"
                  : "DISCONNECTED"}
              </span>
            </div>
          </div>
        </header>

        <main className="dashboard-grid">
          <section className="left-panel">
            <div className="glass-card">
              <div className="label-row" style={{ marginBottom: "2rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                    {activeAsset.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-secondary)",
                      marginTop: "4px",
                    }}
                  >
                    AI4I Advanced Telemetry
                  </p>
                </div>
                <span className="probe-badge-v2">{activeAsset.probeId}</span>
              </div>

              {[
                {
                  label: "Rotational speed (rpm)",
                  key: "rotationalSpeed" as const,
                  min: 800,
                  max: 3000,
                  step: 50,
                },
                {
                  label: "Process temperature (K)",
                  key: "processTemperature" as const,
                  min: 290,
                  max: 360,
                  step: 1,
                },
                {
                  label: "Torque (Nm)",
                  key: "torque" as const,
                  min: 0,
                  max: 100,
                  step: 1,
                },
                {
                  label: "Component wear (min)",
                  key: "toolWear" as const,
                  min: 0,
                  max: 300,
                  step: 5,
                },
              ].map((sensor) => (
                <div className="input-group" key={sensor.key}>
                  <div className="label-row">
                    <span className="label-text">{sensor.label}</span>
                    <span className="value-pill">
                      {activeAsset[sensor.key]}
                    </span>
                  </div>
                  <div className="slider-wrap">
                    <input
                      type="range"
                      min={sensor.min}
                      max={sensor.max}
                      step={sensor.step}
                      value={activeAsset[sensor.key]}
                      onChange={(e) =>
                        updateActiveSensor(sensor.key, parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>
              ))}

              <button
                className="btn-analyze"
                disabled={isLoading}
                onClick={handleAnalyze}
              >
                {isLoading ? (
                  <div className="loader"></div>
                ) : (
                  <span>ANALYZE {activeAsset.name.toUpperCase()}</span>
                )}
              </button>

              {/* ANALYSIS RESULTS AREA */}
              <div className="analysis-results-area">
                <HealthMetricsStrip
                  isAnomaly={activeAsset.isAnomaly}
                  riskPercent={currentRisk}
                  lastCheckedISO={activeAsset.lastCheckedISO}
                />
                <SystemInsight
                  isAnomaly={activeAsset.isAnomaly}
                  riskPercent={currentRisk}
                />
                {/* NEW: Cluster Visualization */}
                <ClusterVisualization
                  clusterId={activeAsset.clusterId}
                  clusterName={activeAsset.clusterName}
                  clusterConfidence={activeAsset.clusterConfidence}
                  clusterRecommendation={activeAsset.clusterRecommendation}
                />
              </div>
            </div>
          </section>

          <section className="right-panel">
            <div className="asset-stack">
              <h3 className="stack-title">Active Facility Systems</h3>
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className={`asset-card clickable ${
                    activeAssetId === asset.id ? "active" : ""
                  } ${
                    activeAssetId === asset.id
                      ? assetGlow === "green"
                        ? "glow-green"
                        : assetGlow === "red"
                        ? "glow-red"
                        : ""
                      : ""
                  }`}
                  onClick={() => setActiveAssetId(asset.id)}
                >
                  <div className="asset-main">
                    <div className="asset-icon">{asset.icon}</div>
                    <div className="asset-info">
                      <h4>{asset.name}</h4>
                      <p>Last checked: {asset.lastChecked}</p>
                    </div>
                  </div>
                  <div
                    className={`asset-status ${
                      asset.isAnomaly === null
                        ? ""
                        : asset.isAnomaly
                        ? "s-critical"
                        : "s-healthy"
                    }`}
                  >
                    {asset.isAnomaly === null
                      ? "NOT CHECKED"
                      : asset.isAnomaly
                      ? "ANOMALY"
                      : "HEALTHY"}
                  </div>
                </div>
              ))}
              <div className="chart-panel">
                <div className="chart-header">
                  <span className="chart-title">
                    History: {activeAsset.name}
                  </span>
                </div>
                <canvas id="historyChart" ref={canvasRef}></canvas>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;
