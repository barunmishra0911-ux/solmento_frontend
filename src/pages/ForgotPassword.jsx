import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const navigate = useNavigate();

  /* form state */

  const [email, setEmail] = useState("");

  const [emailError, setEmailError] = useState("");

  const [isSubmitted, setIsSubmitted] = useState(false);

  /* validate email */

  const validateEmail = (emailValue) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValue.trim()) {
      return "Email is required.";
    }

    if (!emailPattern.test(emailValue.trim())) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  /* handle email input */

  const handleEmailChange = (event) => {
    const value = event.target.value;

    setEmail(value);

    const error = validateEmail(value);

    setEmailError(error);

    if (isSubmitted) {
      setIsSubmitted(false);
    }
  };

  /* handle form submission */

  const handleSubmit = (event) => {
    event.preventDefault();

    const error = validateEmail(email);

    setEmailError(error);

    if (error) {
      return;
    }

    /* frontend-only demo */

    console.log("Password reset request:", email.trim());

    setIsSubmitted(true);
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
        {/* header */}

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
              transition-colors
              hover:text-blue-500
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </button>

          {/* email icon */}

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
            <Mail className="h-8 w-8 text-blue-500" />
          </div>

          {/* title */}

          <div className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-800">
              Forgot Password?
            </CardTitle>

            <CardDescription className="mt-2 leading-6">
              Enter your email address and we'll send you a password reset link.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {isSubmitted ? (
            <div className="space-y-5">
              {/* success message */}

              <div
                className="
                  rounded-xl
                  border
                  border-blue-100
                  bg-blue-50
                  p-4
                "
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className="
                      mt-0.5
                      h-5
                      w-5
                      shrink-0
                      text-blue-500
                    "
                  />

                  <div>
                    <p className="font-semibold text-slate-800">
                      Check your email
                    </p>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      If that email exists, we've sent a reset link.
                    </p>
                  </div>
                </div>
              </div>

              {/* back to login */}

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
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* email */}

              <div className="space-y-2">
                <Label
                  htmlFor="forgot-email"
                  className="text-sm font-semibold text-slate-700"
                >
                  Email Address
                </Label>

                <div className="relative">
                  <Mail
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      h-5
                      w-5
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleEmailChange}
                    className={`
                      h-11
                      rounded-xl
                      border-slate-200
                      pl-12
                      text-sm
                      shadow-sm
                      focus-visible:border-blue-400
                      focus-visible:ring-blue-100
                      ${
                        emailError
                          ? "border-red-500 focus-visible:ring-red-100"
                          : ""
                      }
                    `}
                  />
                </div>

                {emailError && (
                  <p className="text-sm text-red-500">{emailError}</p>
                )}
              </div>

              {/* submit button */}

              <Button
                type="submit"
                disabled={!email.trim()}
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
                Send Reset Link
              </Button>

              {/* back to login */}

              <div className="text-center">
                <span className="text-sm text-slate-500">
                  Remember your password?
                </span>{" "}
                <button
                  type="button"
                  onClick={() => navigate("/auth/login")}
                  className="
                    cursor-pointer
                    text-sm
                    font-medium
                    text-blue-500
                    transition
                    hover:text-blue-600
                    hover:underline
                  "
                >
                  Login
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
