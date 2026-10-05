import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { verifyEmailRequest } from "@/lib/authApi";

import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
  const navigate = useNavigate();

  const { token } = useParams();

  /* states */

  const [isProcessing, setIsProcessing] = useState(true);

  const [isVerified, setIsVerified] = useState(false);

  const [hasError, setHasError] = useState(false);

  const [isResending, setIsResending] = useState(false);

  /* verify email token */

  useEffect(() => {
    const verifyToken = async () => {
      setIsProcessing(true);

      try {
        await verifyEmailRequest(token);
        setIsVerified(true);
        setHasError(false);
      } catch (error) {
        console.error("Email verification failed:", error);

        setHasError(true);
        setIsVerified(false);
      } finally {
        setIsProcessing(false);
      }
    };

    verifyToken();
  }, [token]);

  /* resend verification email */

  const handleResendVerification = async () => {
    if (isResending) {
      return;
    }

    setIsResending(true);

    try {
      /* frontend-only demo */

      await new Promise((resolve) => {
        setTimeout(resolve, 1500);
      });

      console.log("Verification email resent.");

      setHasError(false);
      setIsVerified(false);
    } catch (error) {
      console.error("Unable to resend verification email:", error);
    } finally {
      setIsResending(false);
    }
  };

  /* continue to dashboard */

  const handleContinueToDashboard = () => {
    navigate("/auth/login");
  };

  /* back to login */

  const handleBackToLogin = () => {
    navigate("/auth/login");
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
        {/* processing state */}

        {isProcessing && (
          <>
            <CardContent className="px-6 py-10 text-center sm:px-8">
              {/* processing icon */}

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
                <Loader2
                  className="
                    h-8
                    w-8
                    animate-spin
                    text-blue-500
                  "
                />
              </div>

              {/* processing title */}

              <h1
                className="
                  mt-6
                  text-2xl
                  font-bold
                  text-slate-800
                "
              >
                Verifying Your Email
              </h1>

              {/* processing message */}

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Please wait while we verify your email address.
              </p>
            </CardContent>
          </>
        )}

        {/* success state */}

        {!isProcessing && isVerified && !hasError && (
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
                <CheckCircle2
                  className="
                    h-8
                    w-8
                    text-green-500
                  "
                />
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
                Email Verified Successfully
              </CardTitle>

              {/* success message */}

              <CardDescription
                className="
                  mt-2
                  leading-6
                "
              >
                Your email has been successfully verified. You can now continue
                to your dashboard.
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-8">
              {/* continue button */}

              <Button
                type="button"
                onClick={handleContinueToDashboard}
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
        )}

        {/* failure state */}

        {!isProcessing && hasError && (
          <>
            <CardHeader className="pb-4 pt-8 text-center">
              {/* error icon */}

              <div
                className="
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-red-100
                "
              >
                <AlertCircle
                  className="
                    h-8
                    w-8
                    text-red-500
                  "
                />
              </div>

              {/* error title */}

              <CardTitle
                className="
                  mt-5
                  text-2xl
                  font-bold
                  text-slate-800
                "
              >
                Verification Failed
              </CardTitle>

              {/* error message */}

              <CardDescription
                className="
                  mt-2
                  leading-6
                "
              >
                This verification link is invalid or has expired. Please request
                a new verification email.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pb-8">
              {/* resend button */}

              <Button
                type="button"
                onClick={handleResendVerification}
                disabled={isResending}
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
                {isResending ? (
                  <>
                    <Loader2
                      className="
                        mr-2
                        h-5
                        w-5
                        animate-spin
                      "
                    />
                    Sending...
                  </>
                ) : (
                  "Resend Verification"
                )}
              </Button>

              {/* back to login */}

              <Button
                type="button"
                variant="outline"
                onClick={handleBackToLogin}
                disabled={isResending}
                className="
                  h-11
                  w-full
                  cursor-pointer
                  rounded-xl
                  border-slate-200
                  text-slate-600
                  transition
                  hover:bg-slate-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Back to Login
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
