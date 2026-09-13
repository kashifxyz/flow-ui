import { Link } from '@tanstack/react-router'
import { Icon } from '../components/icons/Icon'
import { ThemeSwitch } from '../components/ThemeSwitch'
import { Wordmark } from '../components/Wordmark'
import { useCurrentUser } from '../hooks/useCurrentUser'

export function LandingPage() {
  const me = useCurrentUser()
  const signedIn = Boolean(me.data)

  return (
    <div className="landing">
      <header className="site-nav">
        <Wordmark />
        <nav className="site-nav-links" aria-label="Product">
          <a href="#workspace">Workspace</a>
          <a href="#connected">Connected work</a>
          <a href="#self-hosted">Self-hosted</a>
        </nav>
        <div className="site-nav-actions">
          <ThemeSwitch />
          {signedIn ? (
            <Link to="/app" className="btn btn-primary">
              Open workspace
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">Unified workspace</p>
          <h1>Pages, data, and space on one graph.</h1>
          <p className="hero-lead">
            Flow is a self-hosted workspace where documents, databases, canvases, and tasks are
            nodes in the same place—not five products taped together.
          </p>
          <div className="hero-actions">
            {signedIn ? (
              <Link to="/app" className="btn btn-primary">
                Continue to workspace
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  Create your workspace
                </Link>
                <Link to="/login" className="btn btn-ghost">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
        <ProductStage />
      </section>

      <section className="band" id="workspace">
        <h2>Built as one system.</h2>
        <p>Each surface is a first-class object. Relations are real, not paste and hope.</p>
        <div className="feature-grid">
          <article className="feature">
            <div className="feature-icon">
              <Icon name="PAGE" size={18} />
            </div>
            <h3>Pages that stay structured</h3>
            <p>Long-form writing with a document store underneath, not a bag of blocks that forget each other.</p>
          </article>
          <article className="feature">
            <div className="feature-icon">
              <Icon name="DATABASE" size={18} />
            </div>
            <h3>Databases with relations</h3>
            <p>Fields, views, and constraints live next to the records they describe. Linked work stays linked.</p>
          </article>
          <article className="feature">
            <div className="feature-icon">
              <Icon name="CANVAS" size={18} />
            </div>
            <h3>Canvas in the same graph</h3>
            <p>Spatial thinking is not a sidecar. Boards, connectors, and pages share identity and permission.</p>
          </article>
        </div>
      </section>

      <section className="band" id="connected">
        <h2>Connected on purpose.</h2>
        <p>The product thesis is a graph of work, not a clone of anyone’s editor chrome.</p>
        <div className="compare">
          <article>
            <h3>Typical stack</h3>
            <ul>
              <li>Docs in one tool, tables in another</li>
              <li>Whiteboard as a PNG graveyard</li>
              <li>Tasks that cannot see the spec</li>
              <li>Identity rented from someone else</li>
            </ul>
          </article>
          <article>
            <h3>Flow</h3>
            <ul>
              <li>
                <strong>One node model</strong> for pages, records, files, and canvases
              </li>
              <li>
                <strong>Email and password</strong> you own—no OAuth maze
              </li>
              <li>
                <strong>Self-hosted</strong> on your Postgres, Redis, and object store
              </li>
              <li>
                <strong>Light, dark, and AMOLED</strong> as first-class themes
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section className="band" id="self-hosted">
        <h2>Runs on your metal.</h2>
        <p>Canonical host flow.sbkashif.com. The same app can live on a machine you control.</p>
        <div className="feature-grid">
          <article className="feature">
            <div className="feature-icon">
              <Icon name="LOCK" size={18} />
            </div>
            <h3>Session cookies</h3>
            <p>HttpOnly sessions and CSRF. Tokens do not live in localStorage.</p>
          </article>
          <article className="feature">
            <div className="feature-icon">
              <Icon name="TASK" size={18} />
            </div>
            <h3>Projects and tasks</h3>
            <p>Execution sits beside the writing and the schema, so plans do not drift into another tab.</p>
          </article>
          <article className="feature">
            <div className="feature-icon">
              <Icon name="USERS" size={18} />
            </div>
            <h3>Workspace ACL</h3>
            <p>Permissions hang off the graph. Sharing is a first-class path, not a screenshot.</p>
          </article>
        </div>
      </section>

      <footer className="site-footer">
        <span>Flow</span>
        <span>Self-hosted unified workspace</span>
      </footer>
    </div>
  )
}

function ProductStage() {
  return (
    <div className="stage" aria-hidden="true">
      <div className="stage-card stage-canvas">
        <div className="stage-kicker">Canvas</div>
        <div className="nodes">
          <div className="node node-a">Brief</div>
          <div className="node node-b">Schema</div>
          <div className="node node-c">Ship</div>
        </div>
      </div>
      <div className="stage-card stage-page">
        <div className="stage-kicker">Page</div>
        <h3>Launch notes</h3>
        <div className="stage-line" />
        <div className="stage-line" />
        <div className="stage-line short" />
      </div>
      <div className="stage-card stage-table">
        <div className="stage-kicker">Database</div>
        <div className="stage-row">
          <strong>Record</strong>
          <strong>Owner</strong>
          <strong>State</strong>
        </div>
        <div className="stage-row">
          <span>Auth sessions</span>
          <span>You</span>
          <span className="chip">Live</span>
        </div>
        <div className="stage-row">
          <span>Node graph</span>
          <span>Flow</span>
          <span className="chip">Linked</span>
        </div>
      </div>
    </div>
  )
}
