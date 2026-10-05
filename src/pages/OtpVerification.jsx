import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

export default function OtpVerification() {
  const navigate = useNavigate();

  const inputRefs = useRef([]);

  /* states */

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [otpError, setOtpError] = useState("");

  const [isVerified, setIsVerified] = useState(false);

  const [isVerifying, setIsVerifying] = useState(false);

  const [isShaking, setIsShaking] = useState(false);

  const [timeLeft, setTimeLeft] = useState(60);

  /* countdown timer */

  useEffect(() => {
    if (timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => (previous > 0 ? previous - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  /* format timer */

  const formattedTime = `00:${String(timeLeft).padStart(2, "0")}`;

  /* verify otp */

  const verifyOtp = async (otpValue) => {
    if (otpValue.length !== 6 || isVerifying) {
      return;
    }

    setIsVerifying(true);

    setOtpError("");

    try {
      /* frontend-only demo */

      await new Promise((resolve) => {
        setTimeout(resolve, 700);
      });

      /*
       * Replace this demo OTP with your backend
       * verification API later.
       */

      const isCorrectOtp = otpValue === "123456";

      if (!isCorrectOtp) {
        setOtpError("Invalid OTP. Please try again.");

        /* shake input */

        setIsShaking(true);

        setTimeout(() => {
          setIsShaking(false);
        }, 450);

        /* clear otp */

        setTimeout(() => {
          setOtp(["", "", "", "", "", ""]);

          inputRefs.current[0]?.focus();
        }, 450);

        return;
      }

      /* otp verified */

      setIsVerified(true);
    } finally {
      setIsVerifying(false);
    }
  };

  /* handle otp input */

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    const updatedOtp = [...otp];

    updatedOtp[index] = digit;

    setOtp(updatedOtp);

    if (otpError) {
      setOtpError("");
    }

    /* move to next input */

    if (digit && index < updatedOtp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    /* auto submit on sixth digit */

    if (
      digit &&
      index === updatedOtp.length - 1 &&
      updatedOtp.every((item) => item !== "")
    ) {
      const enteredOtp = updatedOtp.join("");

      verifyOtp(enteredOtp);
    }
  };

  /* handle backspace */

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /* handle otp paste */

  const handlePaste = (event) => {
    event.preventDefault();

    const pastedValue = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedValue) {
      return;
    }

    const updatedOtp = ["", "", "", "", "", ""];

    pastedValue.split("").forEach((digit, index) => {
      updatedOtp[index] = digit;
    });

    setOtp(updatedOtp);

    setOtpError("");

    const nextIndex = Math.min(pastedValue.length, updatedOtp.length - 1);

    inputRefs.current[nextIndex]?.focus();

    /* auto submit pasted six digit otp */

    if (pastedValue.length === 6) {
      verifyOtp(pastedValue);
    }
  };

  /* resend otp */

  const handleResendOtp = () => {
    if (timeLeft > 0 || isVerifying) {
      return;
    }

    setOtp(["", "", "", "", "", ""]);

    setOtpError("");

    setIsShaking(false);

    setTimeLeft(60);

    inputRefs.current[0]?.focus();

    console.log("OTP resent");
  };

  return (
    <>
      <style>
        {`
          @keyframes otp-shake {
            0% {
              transform: translateX(0);
            }

            20% {
              transform: translateX(-8px);
            }

            40% {
              transform: translateX(8px);
            }

            60% {
              transform: translateX(-6px);
            }

            80% {
              transform: translateX(6px);
            }

            100% {
              transform: translateX(0);
            }
          }
        `}
      </style>

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

                <CardTitle
                  className="
                    mt-5
                    text-2xl
                    font-bold
                    text-slate-800
                  "
                >
                  OTP Verified Successfully
                </CardTitle>

                <CardDescription className="mt-2 leading-6">
                  Your verification is complete. You can now continue to your
                  account.
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-8">
                {/* login button */}

                <Button
                  type="button"
                  onClick={() => navigate("/auth/login")}
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
                  Go to Login
                </Button>
              </CardContent>
            </>
          ) : (
            /* otp form */

            <>
              <CardHeader className="space-y-5">
                {/* back to login */}

                <button
                  type="button"
                  onClick={() => navigate("/auth/login")}
                  disabled={isVerifying}
                  className="
                    flex
                    w-fit
                    cursor-pointer
                    items-center
                    gap-2
                    text-sm
                    font-medium
                    text-slate-500
                    transition-colors
                    hover:text-blue-500
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </button>

                {/* otp icon */}

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-blue-100
                  "
                >
                  <ShieldCheck className="h-7 w-7 text-blue-500" />
                </div>

                {/* title */}

                <div>
                  <CardTitle className="text-2xl font-bold text-slate-800">
                    OTP Verification
                  </CardTitle>

                  <CardDescription className="mt-2 leading-6">
                    Enter the 6-digit verification code sent to your registered
                    email or phone number.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();

                    verifyOtp(otp.join(""));
                  }}
                  className="space-y-6"
                >
                  {/* otp inputs */}

                  <div
                    className="flex justify-center gap-2 sm:gap-3"
                    style={{
                      animation: isShaking
                        ? "otp-shake 0.45s ease-in-out"
                        : "none",
                    }}
                  >
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(element) => {
                          inputRefs.current[index] = element;
                        }}
                        type="text"
                        inputMode="numeric"
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        maxLength={1}
                        value={digit}
                        onChange={(event) =>
                          handleOtpChange(index, event.target.value)
                        }
                        onKeyDown={(event) => handleKeyDown(index, event)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        disabled={isVerifying}
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
                          disabled:cursor-not-allowed
                          disabled:bg-slate-50
                          sm:h-14
                          sm:w-12
                          ${otpError ? "border-red-500" : "border-slate-300"}
                        `}
                        aria-label={`OTP digit ${index + 1}`}
                      />
                    ))}
                  </div>

                  {/* error */}

                  {otpError && (
                    <p
                      className="
                        text-center
                        text-sm
                        font-medium
                        text-red-500
                      "
                      role="alert"
                    >
                      {otpError}
                    </p>
                  )}

                  {/* resend section */}

                  <div className="text-center">
                    <span className="text-sm text-slate-500">
                      Didn't receive the code?{" "}
                    </span>

                    {timeLeft > 0 ? (
                      <span className="text-sm font-medium text-slate-400">
                        Resend code in {formattedTime}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isVerifying}
                        className="
                          cursor-pointer
                          text-sm
                          font-medium
                          text-blue-500
                          transition
                          hover:text-blue-600
                          hover:underline
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        Resend code
                      </button>
                    )}
                  </div>

                  {/* verification status */}

                  {isVerifying && (
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying your code...
                    </div>
                  )}

                  {/* verify button */}

                  <Button
                    type="submit"
                    disabled={otp.join("").length !== 6 || isVerifying}
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
                      disabled:opacity-100
                    "
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
