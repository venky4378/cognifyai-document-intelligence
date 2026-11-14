import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  FileSearch,
  FileText,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { getErrorMessage, loginUser, registerUser } from "../services/api";

export default function AuthPage({ mode, onAuthenticated }) {
  const isRegister = mode === "register";
  const location = useLocation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const notice = location.state?.notice;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (isRegister && !name.trim()) {
      setError("Enter your name to create your account.");
      return;
    }

    setSubmitting(true);

    try {
      if (isRegister) {
        await registerUser({ name: name.trim(), email: email.trim(), password });
      }

      let session;
      try {
        session = await loginUser({ email: email.trim(), password });
      } catch (loginError) {
        if (isRegister) {
          navigate("/login", {
            replace: true,
            state: { notice: "Your account is ready. Sign in with your new credentials." },
          });
          return;
        }
        throw loginError;
      }

      onAuthenticated({
        token: session.token,
        user: { name: name.trim() || email.split("@")[0], email: email.trim() },
      });
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "We couldn't connect to CognifyAI. Please try again.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={`auth-page ${isRegister ? "register-mode" : "login-mode"}`}>
      <section className="auth-story">
        <Link className="brand auth-brand" to="/login">
          <span className="brand-icon"><Sparkles size={20} /></span>
          <span className="brand-copy">
            <strong>Cognify<span>AI</span></strong>
            <small>DOCUMENT INTELLIGENCE</small>
          </span>
        </Link>

        {isRegister ? (
          <div className="story-content register-story-content">
            <div className="story-kicker"><span /> A CLEARER WAY TO WORK</div>
            <h1>Your documents have <span>more to say.</span></h1>
            <p>
              Make a private space for your PDFs, then ask questions and find
              the details that matter.
            </p>
            <div className="register-preview">
              <div className="register-preview-top">
                <span className="register-preview-mark"><Sparkles size={15} /></span>
                <span><strong>Your workspace</strong><small>Everything in one place</small></span>
                <span className="preview-status"><i /> Ready</span>
              </div>
              <div className="preview-document">
                <span className="preview-file"><FileText size={17} /></span>
                <span><strong>Project brief.pdf</strong><small>Added to your library</small></span>
                <Check size={15} />
              </div>
              <div className="preview-answer">
                <span className="preview-sparkle"><Sparkles size={13} /></span>
                <p>Ask a question. Get an answer with helpful source references.</p>
              </div>
            </div>
            <div className="register-benefits">
              <span><Check size={14} /> Your own private workspace</span>
              <span><Check size={14} /> Answers grounded in your files</span>
              <span><Check size={14} /> Get started in just a moment</span>
            </div>
          </div>
        ) : (
          <div className="story-content">
            <div className="story-kicker"><span /> YOUR KNOWLEDGE, UNLOCKED</div>
            <h1>Make every document <span>make sense.</span></h1>
            <p>
              Your files have answers. Bring them together and find what you need
              with a little help from AI.
            </p>

            <div className="story-cards" aria-label="CognifyAI features">
              <div className="story-card">
                <span className="story-card-icon lilac"><FileText size={18} /></span>
                <div><strong>One home for your files</strong><small>Keep important PDFs close at hand.</small></div>
              </div>
              <div className="story-card">
                <span className="story-card-icon peach"><FileSearch size={18} /></span>
                <div><strong>Answers with context</strong><small>Ask questions and see where answers came from.</small></div>
              </div>
            </div>
          </div>
        )}

        <div className="story-bottom"><ShieldCheck size={16} /> Private workspace. Your documents stay yours.</div>
        <div className="story-decoration story-decoration-one" />
        <div className="story-decoration story-decoration-two" />
      </section>

      <section className="auth-side">
        <div className="auth-card">
          <div className="auth-mobile-brand">
            <span className="brand-icon"><Sparkles size={20} /></span>
            <strong>Cognify<span>AI</span></strong>
          </div>
          <div className="auth-heading">
            <span className="auth-icon">{isRegister ? <UserRound size={19} /> : <LockKeyhole size={19} />}</span>
            <p className="auth-eyebrow">{isRegister ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}</p>
            <h2>{isRegister ? "Start your workspace" : "Sign in to CognifyAI"}</h2>
            <p className="auth-subtitle">
              {isRegister
                ? "A calmer, smarter home for all your documents."
                : "Your documents and answers are right where you left them."}
            </p>
          </div>

          {notice && <p className="form-notice" role="status"><Check size={15} />{notice}</p>}

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <label className="field-label">
                Your name
                <span className="input-wrap">
                  <UserRound size={17} />
                  <input
                    autoComplete="name"
                    name="name"
                    placeholder="How should we address you?"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </span>
              </label>
            )}
            <label className="field-label">
              Email address
              <span className="input-wrap">
                <Mail size={17} />
                <input
                  autoComplete="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </span>
            </label>
            <label className="field-label">
              Password
              <span className="input-wrap">
                <LockKeyhole size={17} />
                <input
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  minLength={isRegister ? 5 : undefined}
                  placeholder={isRegister ? "Create a password" : "Enter your password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  className="password-visibility"
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
              {isRegister && <span className="password-hint">Use at least 5 characters.</span>}
            </label>

            {error && <p className="form-error" role="alert">{error}</p>}

            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? (
                <><LoaderCircle className="spin" size={18} /> {isRegister ? "Creating your account..." : "Signing in..."}</>
              ) : (
                <>{isRegister ? "Create account" : "Sign in"} <ArrowRight size={17} /></>
              )}
            </button>
          </form>

          <p className="auth-switch">
            {isRegister ? "Already have an account?" : "New to CognifyAI?"}
            <Link to={isRegister ? "/login" : "/register"}>
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>
          <p className="auth-secure"><ShieldCheck size={14} /> Secure access to your personal workspace</p>
        </div>
        <span className="auth-copyright">© CognifyAI</span>
      </section>
    </main>
  );
}
