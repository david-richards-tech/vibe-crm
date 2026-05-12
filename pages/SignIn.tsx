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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-sm w-full mx-4 p-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-8.514 4.5-19H7.5c0 10.486 2.015 19 4.5 19z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Pipeline CRM</h1>
            <p className="text-xs text-slate-500">Full-service customer management</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {step === "email" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  autoFocus
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent placeholder:text-slate-400"
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
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
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
              <p className="text-sm text-slate-600">
                We sent a 6-digit code to <span className="font-medium text-slate-900">{email}</span>.
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Verification code</label>
                <input
                  value={code}
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm tracking-[0.5em] text-center focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
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
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
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
                className="text-sm text-slate-600 hover:text-slate-900 underline underline-offset-2"
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
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm">
              {err}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
