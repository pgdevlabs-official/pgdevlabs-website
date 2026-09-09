import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  ChevronRight,
  Play,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";

const metrics = [
  { label: "AI automations", value: "18.4k" },
  { label: "Active agents", value: "9.2k" },
  { label: "Avg. ROI", value: "3.8x" },
];

const featureCards = [
  {
    icon: BrainCircuit,
    title: "Model orchestration",
    text: "Route prompts, tools, and workflows across your stack with real-time optimization and memory-aware execution.",
  },
  {
    icon: BarChart3,
    title: "Live analytics",
    text: "Track usage, conversion, latency, and model performance from one decision-ready control layer.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-grade trust",
    text: "Built with secure infrastructure, guardrails, usage limits, and transparent observability for production teams.",
  },
];

const usageBars = [
  { label: "Inference lift", value: 92 },
  { label: "Automation sync", value: 78 },
  { label: "Decision speed", value: 96 },
];

const productTiles = [
  { title: "Agent launchpad", subtitle: "8 active flows", accent: "lime" },
  { title: "Ops cockpit", subtitle: "4.2s p95 latency", accent: "violet" },
  { title: "Signal monitor", subtitle: "99.98% uptime", accent: "blue" },
];

export default function HomePage() {
  return (
    <main className="ai-landing-shell">
      <section className="hero-panel">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <div className="ambient ambient-three" />

        <div className="hero-inner">
          <div className="hero-copy">
            <div className="eyebrow-row">
              <span className="eyebrow-badge">
                <span className="dot" />
                Ship AI products faster
              </span>
            </div>

            <h1 className="hero-title">
              Power the next
              <span className="hero-gradient">generation of AI</span>
              product teams.
            </h1>

            <p className="hero-text">
              PGDevLabs builds premium AI infrastructure, automation layers, and SaaS experiences that turn raw models into operating systems for modern businesses.
            </p>

            <div className="hero-actions">
              <Button href="/apps" size="lg" className="premium-button">
                Explore platform <ArrowRight size={16} />
              </Button>
              <Button href="/about" variant="secondary" size="lg" className="secondary-button">
                <Play size={15} /> Watch demo
              </Button>
            </div>

            <div className="trust-row">
              {metrics.map((metric) => (
                <div key={metric.label} className="trust-pill">
                  <span>{metric.value}</span>
                  <small>{metric.label}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="dashboard-shell glass-panel">
              <div className="dashboard-topbar">
                <div className="window-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="topbar-pill">Live Ops</div>
              </div>

              <div className="dashboard-grid">
                <div className="metric-card metric-primary glass-panel">
                  <div className="metric-meta">
                    <span className="meta-label">Pipeline velocity</span>
                    <span className="trend-up">
                      <TrendingUp size={12} /> 28.4%
                    </span>
                  </div>
                  <div className="metric-value">
                    <AnimatedCounter target={92} suffix="%" />
                  </div>
                  <div className="mini-chart">
                    <span style={{ height: "32%" }} />
                    <span style={{ height: "55%" }} />
                    <span style={{ height: "47%" }} />
                    <span style={{ height: "76%" }} />
                    <span style={{ height: "92%" }} />
                    <span style={{ height: "68%" }} />
                    <span style={{ height: "100%" }} />
                  </div>
                </div>

                <div className="metric-card secondary glass-panel">
                  <span className="meta-label">Agent health</span>
                  <div className="ring-wrap">
                    <div className="ring">
                      <span>94</span>
                    </div>
                  </div>
                </div>

                <div className="metric-card tertiary glass-panel">
                  <span className="meta-label">Workflow score</span>
                  <div className="stacked-metrics">
                    <div>
                      <strong>1.2M</strong>
                      <small>Tasks</small>
                    </div>
                    <div>
                      <strong>7.8s</strong>
                      <small>Cycle</small>
                    </div>
                  </div>
                </div>

                <div className="metric-card large glass-panel">
                  <div className="panel-header">
                    <span className="meta-label">Realtime signals</span>
                    <span className="signal-online">Online</span>
                  </div>

                  <div className="bars-list">
                    {usageBars.map((bar) => (
                      <div key={bar.label} className="bar-row">
                        <span>{bar.label}</span>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${bar.value}%` }} />
                        </div>
                        <strong>{bar.value}%</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="short-stats" aria-label="Platform proof points">
        <div className="section-intro proof-intro">
          <span className="section-number">01</span>
          <div>
            <p className="section-kicker">Signal over noise</p>
            <p className="section-note">The operating layer behind every launch.</p>
          </div>
        </div>
        <div className="stat-grid">
          <div className="stat-block">
            <span className="stat-label">Launch velocity</span>
            <strong><AnimatedCounter target={4.8} decimals={1} />x</strong>
          </div>
          <div className="stat-block">
            <span className="stat-label">Models wired</span>
            <strong>32</strong>
          </div>
          <div className="stat-block">
            <span className="stat-label">SLA coverage</span>
            <strong>99.98%</strong>
          </div>
        </div>
      </section>

      <section className="features-section" id="platform">
        <div className="section-heading">
          <div>
            <span className="section-number">02</span>
            <p className="section-kicker">Built for ambitious teams</p>
            <h2>One operating layer for AI execution.</h2>
            <p className="section-description">From first prompt to production workflow, keep the important work in one clear command layer.</p>
          </div>
          <Link href="/apps" className="inline-link">
            Explore apps <ChevronRight size={15} />
          </Link>
        </div>

        <div className="feature-grid">
          {featureCards.map(({ icon: Icon, title, text }) => (
            <article key={title} className="feature-card glass-panel">
              <div className="feature-icon">
                <Icon size={18} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bento-section" id="system">
        <div className="section-intro">
          <span className="section-number">03</span>
          <div>
            <p className="section-kicker">Inside the system</p>
            <p className="section-note">A closer look at the signals your team can act on.</p>
          </div>
        </div>
        <div className="bento-grid">
          <article className="bento-card tall glass-panel">
            <div className="bento-header">
              <div>
                <p className="mini-tag">System overview</p>
                <h3>AI command center</h3>
              </div>
              <Sparkles size={17} />
            </div>
            <div className="command-tiles">
              {productTiles.map((tile) => (
                <div key={tile.title} className={`command-tile ${tile.accent}`}>
                  <strong>{tile.title}</strong>
                  <span>{tile.subtitle}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="bento-card glass-panel">
            <div className="bento-header compact">
              <div>
                <p className="mini-tag">Autonomy</p>
                <h3>Task completion</h3>
              </div>
              <Zap size={16} />
            </div>
            <div className="progress-ring">
              <div className="ring-small">
                <span>86%</span>
              </div>
            </div>
          </article>

          <article className="bento-card glass-panel">
            <div className="bento-header compact">
              <div>
                <p className="mini-tag">Signals</p>
                <h3>Response accuracy</h3>
              </div>
              <Bot size={16} />
            </div>
            <ul className="signal-list">
              <li>
                <span className="signal-dot lime" />
                96.3% answer quality
              </li>
              <li>
                <span className="signal-dot blue" />
                74ms routing latency
              </li>
              <li>
                <span className="signal-dot violet" />
                12 integrations live
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section className="cta-section" id="contact">
        <div className="cta-panel glass-panel">
          <div className="cta-copy">
            <span className="section-number">04</span>
            <p className="section-kicker">Ready to launch</p>
            <h2>Turn AI ambition into a product people trust.</h2>
          </div>
          <Button href="/contact" size="lg" className="premium-button">
            Book a strategy call <ArrowRight size={16} />
          </Button>
        </div>
      </section>
    </main>
  );
}

