import React from "react";
import { sendCode, verifyCode, type AppUser } from "../lib/auth";

export default function SignIn({ onSignedIn }: { onSignedIn: (u: AppUser) => void }) {
  const [step, setStep] = React.useState<"email" | "code">("email");
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const submit = async (fn: () => Promise<void>) => {
    setBusy(true);
    setErr(null);
    try {
      await fn();
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #ede9fe 100%)" }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-violet-300/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-indigo-200/20 blur-2xl" />
        </div>
        <div className="relative z-10 max-w-md px-8 text-center">
          <div className="h-16 w-16 rounded-2xl mx-auto mb-8 flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-lg">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-8.514 4.5-19H7.5c0 10.486 2.015 19 4.5 19z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Pipeline CRM</h1>
          <p className="text-indigo-100 text-lg leading-relaxed">Full-service customer relationship management. Track deals, manage contacts, and grow your pipeline.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-8.514 4.5-19H7.5c0 10.486 2.015 19 4.5 19z" />
              </svg>
            </div>
            <span className="font-bold text-indigo-900 text-xl tracking-tight">Pipeline CRM</span>
          </div>

          <div className="p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-indigo-100 shadow-xl shadow-indigo-100/50">
            <h2 className="text-xl font-bold text-indigo-900 mb-1">Welcome back</h2>
            <p className="text-sm text-indigo-400 mb-6">Sign in to your account</p>

            <div className="flex flex-col gap-4">
              {step === "email" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-indigo-800 mb-1.5">Email address</label>
                    <input
                      type="email"
                      value={email}
                      autoFocus
                      placeholder="you@company.com"
                      className="w-full rounded-xl border border-indigo-200 bg-white/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-indigo-300"
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && email && !busy) {
                          submit(async () => {
                            await sendCode(email);
                            setStep("code");
                          });
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={busy || !email}
                    className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}
                    onClick={() =>
                      submit(async () => {
                        await sendCode(email);
                        setStep("code");
                      })
                    }
                  >
                    {busy ? "Sending…" : "Send verification code"}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-indigo-600">
                    We sent a 6-digit code to <span className="font-semibold text-indigo-800">{email}</span>.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-indigo-800 mb-1.5">Verification code</label>
                    <input
                      value={code}
                      autoFocus
                      inputMode="numeric"
                      maxLength={6}
                      className="w-full rounded-xl border border-indigo-200 bg-white/60 px-4 py-3 text-sm tracking-[0.5em] text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && code.length === 6 && !busy) {
                          submit(async () => {
                            onSignedIn(await verifyCode(email, code));
                          });
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={busy || code.length !== 6}
                    className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}
                    onClick={() =>
                      submit(async () => {
                        onSignedIn(await verifyCode(email, code));
                      })
                    }
                  >
                    {busy ? "Verifying…" : "Verify & sign in"}
                  </button>
                  <button
                    type="button"
                    className="text-sm text-indigo-500 hover:text-indigo-700 underline underline-offset-2"
                    onClick={() => {
                      setStep("email");
                      setCode("");
                    }}
                  >
                    Use a different email
                  </button>
                </>
              )}
              {err && (
                <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-sm">{err}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
