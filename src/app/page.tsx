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

const metrics = [
  { label: "Products shipped", value: "12+" },
  { label: "Years building", value: "06" },
  { label: "Ideas shipped", value: "∞" },
];

const featureCards = [
  {
    icon: BrainCircuit,
    title: "Product engineering",
    text: "From a rough idea to a polished, production-ready product with thoughtful UX and reliable engineering underneath.",
  },
  {
    icon: BarChart3,
    title: "Full-stack delivery",
    text: "Web apps, mobile experiences, APIs, and dashboards that work together as one coherent product system.",
  },
  {
    icon: ShieldCheck,
    title: "Built to be useful",
    text: "Every project starts with a real user problem, then gets shaped into something fast, clear, and worth coming back to.",
  },
];

const usageBars = [
  { label: "TypeScript", value: 92 },
  { label: "React / Next", value: 96 },
  { label: "Product thinking", value: 88 },
];

const productTiles = [
  { title: "KharchaMate", subtitle: "Expense tracking app", accent: "lime" },
  { title: "PGDevLabs web", subtitle: "Studio platform", accent: "violet" },
  { title: "New experiments", subtitle: "Always in progress", accent: "blue" },
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
                Independent developer studio
              </span>
            </div>

            <h1 className="hero-title">
              I build digital
              <span className="hero-gradient">products that ship.</span>
            </h1>

            <p className="hero-text">
              PGDevLabs is an independent developer studio creating useful apps, thoughtful interfaces, and the systems that make them feel effortless.
            </p>

            <div className="hero-actions">
              <Button href="/apps" size="lg" className="premium-button">
                See products <ArrowRight size={16} />
              </Button>
              <Button href="/about" variant="secondary" size="lg" className="secondary-button">
                <Play size={15} /> How I work
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
                <div className="topbar-pill">Developer console</div>
              </div>

              <div className="dashboard-grid">
                <div className="metric-card metric-primary glass-panel">
                  <div className="metric-meta">
                    <span className="meta-label">Build velocity</span>
                    <span className="trend-up">
                      <TrendingUp size={12} /> 28.4%
                    </span>
                  </div>
                  <div className="metric-value">
                    12 shipped
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
                    <span className="meta-label">Current focus</span>
                  <div className="ring-wrap">
                    <div className="ring">
                      <span>06</span>
                    </div>
                  </div>
                </div>

                <div className="metric-card tertiary glass-panel">
                    <span className="meta-label">Stack in use</span>
                  <div className="stacked-metrics">
                    <div>
                      <strong>TS</strong>
                      <small>Core</small>
                    </div>
                    <div>
                      <strong>Next</strong>
                      <small>Web</small>
                    </div>
                  </div>
                </div>

                <div className="metric-card large glass-panel">
                  <div className="panel-header">
                    <span className="meta-label">What I bring to a build</span>
                    <span className="signal-online">In progress</span>
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
            <p className="section-kicker">A small track record</p>
            <p className="section-note">Real products, shipped with care.</p>
          </div>
        </div>
        <div className="stat-grid">
          <div className="stat-block">
            <span className="stat-label">Products shipped</span>
            <strong>12+</strong>
          </div>
          <div className="stat-block">
            <span className="stat-label">Technologies used</span>
            <strong>20+</strong>
          </div>
          <div className="stat-block">
            <span className="stat-label">Curiosity level</span>
            <strong>100%</strong>
          </div>
        </div>
      </section>

      <section className="features-section" id="platform">
        <div className="section-heading">
          <div>
            <span className="section-number">02</span>
            <p className="section-kicker">How I build</p>
            <h2>Good ideas deserve good execution.</h2>
            <p className="section-description">I care about the full journey: understanding the problem, shaping the interface, writing the code, and getting the product into people&apos;s hands.</p>
          </div>
          <Link href="/apps" className="inline-link">
            See my work <ChevronRight size={15} />
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
            <p className="section-kicker">The workbench</p>
            <p className="section-note">A glimpse into what is being built.</p>
          </div>
        </div>
        <div className="bento-grid">
          <article className="bento-card tall glass-panel">
            <div className="bento-header">
              <div>
                <p className="mini-tag">Selected work</p>
                <h3>Projects in motion</h3>
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
                <p className="mini-tag">Craft</p>
                <h3>Details matter</h3>
              </div>
              <Zap size={16} />
            </div>
            <div className="progress-ring">
              <div className="ring-small">
                <span>100%</span>
              </div>
            </div>
          </article>

          <article className="bento-card glass-panel">
            <div className="bento-header compact">
              <div>
                <p className="mini-tag">Workflow</p>
                <h3>From idea to launch</h3>
              </div>
              <Bot size={16} />
            </div>
            <ul className="signal-list">
              <li>
                <span className="signal-dot lime" />
                Idea to interface
              </li>
              <li>
                <span className="signal-dot blue" />
                Design to code
              </li>
              <li>
                <span className="signal-dot violet" />
                Code to production
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section className="cta-section" id="contact">
        <div className="cta-panel glass-panel">
          <div className="cta-copy">
            <span className="section-number">04</span>
            <p className="section-kicker">Have a thing to build?</p>
            <h2>Let&apos;s make something people enjoy using.</h2>
          </div>
          <Button href="/contact" size="lg" className="premium-button">
            Book a strategy call <ArrowRight size={16} />
          </Button>
        </div>
      </section>
    </main>
  );
}

