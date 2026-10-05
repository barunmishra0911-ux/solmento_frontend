import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ArrowLeft, CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

export default function TwoFactorAuthentication() {
  const navigate = useNavigate();

  const inputRefs = useRef([]);

  /* states */

  const [code, setCode] = useState(["", "", "", "", "", ""]);

  const [codeError, setCodeError] = useState("");

  const [isVerified, setIsVerified] = useState(false);

  const [isBackupMode, setIsBackupMode] = useState(false);

  const [backupCode, setBackupCode] = useState("");

  const [backupCodeError, setBackupCodeError] = useState("");

  /* handle code input */

  const handleCodeChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    const updatedCode = [...code];

    updatedCode[index] = digit;

    setCode(updatedCode);

    if (codeError) {
      setCodeError("");
    }

    /* move to next input */

    if (digit && index < updatedCode.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /* handle backspace */

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /* handle code paste */

  const handlePaste = (event) => {
    event.preventDefault();

    const pastedValue = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedValue) {
      return;
    }

    const updatedCode = ["", "", "", "", "", ""];

    pastedValue.split("").forEach((digit, index) => {
      updatedCode[index] = digit;
    });

    setCode(updatedCode);

    setCodeError("");

    const nextIndex = Math.min(pastedValue.length, updatedCode.length - 1);

    inputRefs.current[nextIndex]?.focus();
  };

  /* verify authenticator code */

  const handleSubmit = (event) => {
    event.preventDefault();

    const enteredCode = code.join("");

    if (enteredCode.length !== 6) {
      setCodeError("Please enter the complete 6-digit code.");

      return;
    }

    /* frontend-only demo */

    console.log("Authenticator code:", enteredCode);

    if (enteredCode !== "123456") {
      setCodeError("Invalid authenticator code. Please try again.");

      return;
    }

    setCodeError("");

    setIsVerified(true);
  };

  /* use backup code */

  const handleBackupCode = () => {
    setIsBackupMode(true);

    setCodeError("");

    setCode(["", "", "", "", "", ""]);
  };

  /* verify backup code */

  const handleBackupSubmit = (event) => {
    event.preventDefault();

    if (!backupCode.trim()) {
      setBackupCodeError("Backup code is required.");

      return;
    }

    /* frontend-only demo */

    console.log("Backup code:", backupCode);

    if (backupCode.trim() !== "BACKUP123") {
      setBackupCodeError("Invalid backup code. Please try again.");
      return;
    }

    setBackupCodeError("");

    setIsVerified(true);
  };

  /* use authenticator code */

  const handleAuthenticatorCode = () => {
    setIsBackupMode(false);

    setBackupCode("");

    setBackupCodeError("");

    setCodeError("");

    setCode(["", "", "", "", "", ""]);
  };

  return (
    <div
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-slate-100
        p-4
      "
    >
      <Card
        className="
          w-full
          max-w-md
          rounded-2xl
          border-slate-200
          bg-white
          shadow-xl
        "
      >
        {isVerified ? (
          /* success state */

          <>
            <CardHeader className="pb-4 pt-8 text-center">
              {/* success icon */}

              <div
                className="
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-green-100
                "
              >
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>

              {/* success title */}

              <CardTitle className="mt-5 text-2xl font-bold text-slate-800">
                Verification Successful
              </CardTitle>

              <CardDescription className="mt-2 leading-6">
                You have successfully completed two-factor authentication.
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-8">
              {/* dashboard button */}

              <Button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="
                  h-11
                  w-full
                  cursor-pointer
                  rounded-xl
                  bg-blue-500
                  font-semibold
                  text-white
                  transition
                  hover:bg-blue-600
                "
              >
                Continue to Dashboard
              </Button>
            </CardContent>
          </>
        ) : isBackupMode ? (
          /* backup code */

          <>
            <CardHeader className="space-y-5">
              {/* back to login */}

              <button
                type="button"
                onClick={() => navigate("/auth/login")}
                className="
                  flex
                  w-fit
                  cursor-pointer
                  items-center
                  gap-2
                  text-sm
                  font-medium
                  text-slate-500
                  transition
                  hover:text-blue-500
                "
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </button>

              {/* backup icon */}

              <div
                className="
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-blue-100
                "
              >
                <KeyRound className="h-8 w-8 text-blue-500" />
              </div>

              {/* title */}

              <div className="text-center">
                <CardTitle className="text-2xl font-bold text-slate-800">
                  Use Backup Code
                </CardTitle>

                <CardDescription className="mt-2 leading-6">
                  Enter one of your backup codes to continue.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="pb-8">
              <form onSubmit={handleBackupSubmit} className="space-y-5">
                {/* backup code */}

                <div className="space-y-2">
                  <label
                    htmlFor="backup-code"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Backup Code
                  </label>

                  <input
                    id="backup-code"
                    type="text"
                    placeholder="Enter your backup code"
                    value={backupCode}
                    onChange={(event) => {
                      setBackupCode(event.target.value);

                      if (backupCodeError) {
                        setBackupCodeError("");
                      }
                    }}
                    className="mt-1
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      px-4
                      text-sm
                      outline-none
                      shadow-sm
                      focus:border-blue-400
                      focus:ring-2
                      focus:ring-blue-100
                    "
                  />

                  {backupCodeError && (
                    <p className="text-sm text-red-500">{backupCodeError}</p>
                  )}
                </div>

                {/* verify backup code */}

                <Button
                  type="submit"
                  disabled={!backupCode.trim()}
                  className="
                    h-11
                    w-full
                    cursor-pointer
                    rounded-xl
                    bg-blue-500
                    font-semibold
                    text-white
                    transition
                    hover:bg-blue-600
                    disabled:cursor-not-allowed
                    disabled:bg-slate-300
                  "
                >
                  Verify Backup Code
                </Button>

                {/* authenticator link */}

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleAuthenticatorCode}
                    className="
                      cursor-pointer
                      text-sm
                      font-medium
                      text-blue-500
                      hover:underline
                    "
                  >
                    Use authenticator code instead
                  </button>
                </div>
              </form>
            </CardContent>
          </>
        ) : (
          /* authenticator code */

          <>
            <CardHeader className="space-y-5">
              {/* back to login */}

              <button
                type="button"
                onClick={() => navigate("/auth/login")}
                className="
                  flex
                  w-fit
                  cursor-pointer
                  items-center
                  gap-2
                  text-sm
                  font-medium
                  text-slate-500
                  transition
                  hover:text-blue-500
                "
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </button>

              {/* 2fa icon */}

              <div
                className="
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-blue-100
                "
              >
                <ShieldCheck className="h-8 w-8 text-blue-500" />
              </div>

              {/* title */}

              <div className="text-center">
                <CardTitle className="text-2xl font-bold text-slate-800">
                  Two-Factor Authentication
                </CardTitle>

                <CardDescription className="mt-2 leading-6">
                  Enter the 6-digit code from your authenticator app to
                  continue.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* authenticator code */}

                <div className="flex justify-center gap-2 sm:gap-3">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        inputRefs.current[index] = element;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(event) =>
                        handleCodeChange(index, event.target.value)
                      }
                      onKeyDown={(event) => handleKeyDown(index, event)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className={`
                        h-12
                        w-11
                        rounded-lg
                        border
                        text-center
                        text-lg
                        font-semibold
                        outline-none
                        transition
                        focus:border-blue-500
                        focus:ring-2
                        focus:ring-blue-100
                        sm:h-14
                        sm:w-12
                        ${codeError ? "border-red-500" : "border-slate-300"}
                      `}
                      aria-label={`Authenticator code digit ${index + 1}`}
                    />
                  ))}
                </div>

                {/* error */}

                {codeError && (
                  <p className="text-center text-sm font-medium text-red-500">
                    {codeError}
                  </p>
                )}

                {/* backup code link */}

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleBackupCode}
                    className="
                      cursor-pointer
                      text-sm
                      font-medium
                      text-blue-500
                      hover:underline
                    "
                  >
                    Use backup code instead
                  </button>
                </div>

                {/* verify button */}

                <Button
                  type="submit"
                  disabled={code.join("").length !== 6}
                  className="
                    h-11
                    w-full
                    cursor-pointer
                    rounded-xl
                    bg-blue-500
                    font-semibold
                    text-white
                    transition
                    hover:bg-blue-600
                    disabled:cursor-not-allowed
                    disabled:bg-slate-300
                  "
                >
                  Verify Code
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
