import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import api, { getErrorMessage, loginUser, registerUser } from "../services/api";
import "./Auth.css";

export default function AuthPage({ mode = "login", onAuthenticated }) {
  // Modes: "login" | "register" | "forgot"
  const [currentMode, setCurrentMode] = useState(mode);
  const [otpStep, setOtpStep] = useState(1); // 1 = Enter email, 2 = Enter OTP & new password

  const navigate = useNavigate();

  // Inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  // States
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCurrentMode(mode || "login");
    setError("");
    setStatusMessage("");
    setOtpStep(1);
  }, [mode]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setStatusMessage("");
    setSubmitting(true);

    try {
      // 1. FORGOT PASSWORD FLOW
      if (currentMode === "forgot") {
        if (otpStep === 1) {
          const response = await api.post("/auth/forgot-password", { email: email.trim() });
          setStatusMessage(response.data || `A 6-digit OTP code has been sent to ${email}`);
          setOtpStep(2);
          return;
        }

        if (otpStep === 2) {
          if (otp.trim().length !== 6) {
            setError("Please enter the complete 6-digit verification code.");
            return;
          }
          if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
          }

          await api.post("/auth/reset-password-otp", {
            email: email.trim(),
            otp: otp.trim(),
            newPassword: password,
          });

          setStatusMessage("Password reset successfully. Redirecting to sign in...");
          setTimeout(() => {
            setCurrentMode("login");
            setOtpStep(1);
            setPassword("");
            setConfirmPassword("");
            setOtp("");
            navigate("/login");
          }, 2000);
          return;
        }
      }

      // 2. REGISTER FLOW
      if (currentMode === "register") {
        await registerUser({ name: name.trim(), email: email.trim(), password });
      }

      // 3. LOGIN FLOW
      const session = await loginUser({ email: email.trim(), password });
      onAuthenticated({
        token: session.token,
        user: { name: name.trim() || email.split("@")[0], email: email.trim() },
      });
    } catch (err) {
      setError(getErrorMessage(err, "Authentication request failed. Please check your inputs."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dev-auth-page">
      <div className="dev-ambient-glow" />

      <div className="dev-auth-container">
        {/* Top Brand Header */}
        <header className="dev-auth-header">
          <div className="dev-brand-badge">
            <Sparkles size={14} /> DOCUAI INTELLIGENCE
          </div>
          <div className="dev-brand-logo">
            <div className="dev-brand-logo-icon">
              <Sparkles size={20} />
            </div>
            <h1 className="dev-brand-title">Docu<span>AI</span></h1>
          </div>
          <p>
            {currentMode === "forgot"
              ? "Recover access to your workspace"
              : currentMode === "register"
              ? "Create your personal workspace account"
              : "Sign in to manage and query your documents"}
          </p>
        </header>

        {/* Auth Card */}
        <div className="dev-auth-card">
          {/* Segmented Mode Selector (Sign In vs Create Account) */}
          {currentMode !== "forgot" && (
            <div className="dev-auth-tabs">
              <button
                type="button"
                className={`dev-auth-tab ${currentMode === "login" ? "active" : ""}`}
                onClick={() => {
                  setCurrentMode("login");
                  setError("");
                  setStatusMessage("");
                  navigate("/login");
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`dev-auth-tab ${currentMode === "register" ? "active" : ""}`}
                onClick={() => {
                  setCurrentMode("register");
                  setError("");
                  setStatusMessage("");
                  navigate("/register");
                }}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Alerts */}
          {statusMessage && (
            <div className="dev-alert success">
              <CheckCircle2 size={16} />
              <span>{statusMessage}</span>
            </div>
          )}

          {error && (
            <div className="dev-alert error" role="alert">
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="dev-form">
            {/* Full Name (Create Account Only) */}
            {currentMode === "register" && (
              <div className="dev-field">
                <label>Full Name</label>
                <div className="dev-input-wrap">
                  <UserRound size={17} className="dev-input-icon" />
                  <input
                    type="text"
                    className="dev-input"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            {(currentMode !== "forgot" || otpStep === 1) && (
              <div className="dev-field">
                <label>Email Address</label>
                <div className="dev-input-wrap">
                  <Mail size={17} className="dev-input-icon" />
                  <input
                    type="email"
                    className="dev-input"
                    placeholder="you@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* OTP Step 2: 6-Digit Code */}
            {currentMode === "forgot" && otpStep === 2 && (
              <div className="dev-field">
                <label>6-Digit OTP Code</label>
                <div className="dev-input-wrap">
                  <KeyRound size={17} className="dev-input-icon" />
                  <input
                    type="text"
                    maxLength={6}
                    className="dev-input dev-input-otp"
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>
                <span className="dev-field-hint">Verification code sent to {email}</span>
              </div>
            )}

            {/* Password */}
            {(currentMode !== "forgot" || otpStep === 2) && (
              <div className="dev-field">
                <div className="dev-field-header">
                  <label>{currentMode === "forgot" ? "New Password" : "Password"}</label>
                  {currentMode === "login" && (
                    <button
                      type="button"
                      className="dev-link-inline"
                      onClick={() => {
                        setCurrentMode("forgot");
                        setOtpStep(1);
                        setError("");
                        setStatusMessage("");
                      }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="dev-input-wrap">
                  <LockKeyhole size={17} className="dev-input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="dev-input"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="dev-input-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (Forgot Step 2) */}
            {currentMode === "forgot" && otpStep === 2 && (
              <div className="dev-field">
                <label>Confirm New Password</label>
                <div className="dev-input-wrap">
                  <LockKeyhole size={17} className="dev-input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="dev-input"
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              className="dev-btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <LoaderCircle size={18} className="dev-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {currentMode === "forgot"
                      ? (otpStep === 1 ? "Send 6-Digit OTP" : "Reset Password")
                      : currentMode === "register"
                      ? "Create Account"
                      : "Sign In"}
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Forgot Password Back Link */}
          {currentMode === "forgot" && (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                type="button"
                className="dev-link-inline"
                onClick={() => {
                  setCurrentMode("login");
                  setOtpStep(1);
                  setError("");
                  setStatusMessage("");
                }}
              >
                ← Back to Sign In
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <footer className="dev-meta-footer">
          <span><ShieldCheck size={14} /> End-to-End Encrypted</span>
          <span>•</span>
          <span>Spring Security + JWT</span>
          <span>•</span>
          <span>DocuAI v1.0</span>
        </footer>
      </div>
    </div>
  );
}
