import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldAlert,
} from "lucide-react";

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

export default function ResetPassword() {
  const navigate = useNavigate();

  const { token } = useParams();

  /* states */

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState("");

  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [isReset, setIsReset] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [isTokenValid, setIsTokenValid] = useState(true);

  /* validate password */

  const validatePassword = (passwordValue) => {
    if (!passwordValue) {
      return "Password is required.";
    }

    if (passwordValue.length < 8) {
      return "Password must be at least 8 characters.";
    }

    return "";
  };

  /* validate confirm password */

  const validateConfirmPassword = (passwordValue, confirmPasswordValue) => {
    if (!confirmPasswordValue) {
      return "Please confirm your password.";
    }

    if (passwordValue !== confirmPasswordValue) {
      return "Passwords do not match.";
    }

    return "";
  };

  /* handle password input */

  const handlePasswordChange = (event) => {
    const value = event.target.value;

    setPassword(value);

    const error = validatePassword(value);

    setPasswordError(error);

    if (confirmPassword) {
      setConfirmPasswordError(validateConfirmPassword(value, confirmPassword));
    }
  };

  /* handle confirm password input */

  const handleConfirmPasswordChange = (event) => {
    const value = event.target.value;

    setConfirmPassword(value);

    const error = validateConfirmPassword(password, value);

    setConfirmPasswordError(error);
  };

  /* handle reset password */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const currentPasswordError = validatePassword(password);

    const currentConfirmPasswordError = validateConfirmPassword(
      password,
      confirmPassword,
    );

    setPasswordError(currentPasswordError);

    setConfirmPasswordError(currentConfirmPasswordError);

    if (currentPasswordError || currentConfirmPasswordError) {
      return;
    }

    setIsLoading(true);

    try {
      /* frontend-only token check */

      /*
       * Replace this section with your real
       * backend token verification later.
       *
       * For demo purposes, an empty or "invalid"
       * token is treated as invalid.
       */

      if (!token || token === "invalid") {
        setIsTokenValid(false);

        return;
      }

      console.log("Reset token:", token);

      console.log("New password:", password);

      /* simulate API request */

      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });

      /* show success state */

      setIsReset(true);
    } finally {
      setIsLoading(false);
    }
  };

  /* request new reset link */

  const handleRequestNewLink = () => {
    navigate("/auth/forget-password");
  };

  /* go to login */

  const handleGoToLogin = () => {
    /*
     * The success message is passed to the login page.
     * Your Login.jsx can read this route state and
     * display the toast there.
     */

    navigate("/auth/login", {
      state: {
        successMessage: "Your password has been reset successfully.",
      },
    });
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
        {isTokenValid ? (
          isReset ? (
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
                  Password Reset Successfully
                </CardTitle>

                <CardDescription className="mt-2 leading-6">
                  Your password has been updated successfully. You can now login
                  with your new password.
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-8">
                {/* login button */}

                <Button
                  type="button"
                  onClick={handleGoToLogin}
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
            /* reset password form */

            <>
              <CardHeader className="space-y-5">
                {/* back to login */}

                <button
                  type="button"
                  onClick={() => navigate("/auth/login")}
                  disabled={isLoading}
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

                {/* lock icon */}

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
                  <KeyRound
                    className="
                      h-8
                      w-8
                      text-blue-500
                    "
                  />
                </div>

                {/* title */}

                <div className="text-center">
                  <CardTitle
                    className="
                      text-2xl
                      font-bold
                      text-slate-800
                    "
                  >
                    Reset Password
                  </CardTitle>

                  <CardDescription className="mt-2 leading-6">
                    Create a new password for your account.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="pb-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* new password */}

                  <div className="space-y-2">
                    <Label
                      htmlFor="reset-password"
                      className="
                        text-sm
                        font-semibold
                        text-slate-700
                      "
                    >
                      New Password
                    </Label>

                    <div className="relative">
                      <KeyRound
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
                        id="reset-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        value={password}
                        onChange={handlePasswordChange}
                        disabled={isLoading}
                        className={`
                          h-11
                          rounded-xl
                          border-slate-200
                          pl-12
                          pr-12
                          text-sm
                          shadow-sm
                          focus-visible:border-blue-400
                          focus-visible:ring-blue-100
                          ${
                            passwordError
                              ? "border-red-500 focus-visible:ring-red-100"
                              : ""
                          }
                        `}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((previous) => !previous)}
                        disabled={isLoading}
                        className="
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          cursor-pointer
                          rounded-md
                          p-1.5
                          text-slate-400
                          transition
                          hover:text-slate-700
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {passwordError && (
                      <p className="text-sm text-red-500">{passwordError}</p>
                    )}
                  </div>

                  {/* confirm password */}

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirm-password"
                      className="
                        text-sm
                        font-semibold
                        text-slate-700
                      "
                    >
                      Confirm Password
                    </Label>

                    <div className="relative">
                      <KeyRound
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
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        disabled={isLoading}
                        className={`
                          h-11
                          rounded-xl
                          border-slate-200
                          pl-12
                          pr-12
                          text-sm
                          shadow-sm
                          focus-visible:border-blue-400
                          focus-visible:ring-blue-100
                          ${
                            confirmPasswordError
                              ? "border-red-500 focus-visible:ring-red-100"
                              : ""
                          }
                        `}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((previous) => !previous)
                        }
                        disabled={isLoading}
                        className="
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          cursor-pointer
                          rounded-md
                          p-1.5
                          text-slate-400
                          transition
                          hover:text-slate-700
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {confirmPassword.length > 0 && !confirmPasswordError && (
                      <div className="flex items-center gap-2 text-sm font-medium text-green-500">
                        <CheckCircle2 className="h-4 w-4" />
                        Passwords match
                      </div>
                    )}

                    {confirmPasswordError && (
                      <p className="text-sm text-red-500">
                        {confirmPasswordError}
                      </p>
                    )}
                  </div>

                  {/* reset button */}

                  <Button
                    type="submit"
                    disabled={
                      !password ||
                      !confirmPassword ||
                      !!passwordError ||
                      !!confirmPasswordError ||
                      isLoading
                    }
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
                    {isLoading ? (
                      <>
                        <Loader2
                          className="
                            mr-2
                            h-5
                            w-5
                            animate-spin
                          "
                        />
                        Updating Password...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </form>
              </CardContent>
            </>
          )
        ) : (
          /* invalid or expired link */

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
                <ShieldAlert
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
                Reset Link Invalid
              </CardTitle>

              <CardDescription className="mt-2 leading-6">
                This password reset link is invalid or has expired. Please
                request a new link to reset your password.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pb-8">
              {/* request new link */}

              <Button
                type="button"
                onClick={handleRequestNewLink}
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
                Request a New Link
              </Button>

              {/* back to login */}

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/auth/login")}
                className="
                  h-11
                  w-full
                  cursor-pointer
                  rounded-xl
                  border-slate-200
                  text-slate-600
                  hover:bg-slate-50
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
