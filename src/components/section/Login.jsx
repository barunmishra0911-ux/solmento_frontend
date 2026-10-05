import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginRequest, logoutRequest } from "@/lib/authApi";

import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
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

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  /* states */

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(true);

  const [emailError, setEmailError] = useState("");

  const [passwordError, setPasswordError] = useState("");

  const [authError, setAuthError] = useState(() =>
    new URLSearchParams(location.search).get("reason") === "session-expired"
      ? "Your session expired. Please sign in again."
      : "",
  );

  const [selectedRoleTab, setSelectedRoleTab] = useState("admin");

  const [isLoading, setIsLoading] = useState(false);

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

  /* validate password */

  const validatePassword = (passwordValue) => {
    if (!passwordValue) {
      return "Password is required.";
    }

    if (passwordValue.length < 6) {
      return "Password must be at least 6 characters.";
    }

    return "";
  };

  /* handle email */

  const handleEmailChange = (event) => {
    const value = event.target.value;

    setEmail(value);

    if (emailError) {
      setEmailError("");
    }

    if (authError) {
      setAuthError("");
    }
  };

  /* handle password */

  const handlePasswordChange = (event) => {
    const value = event.target.value;

    setPassword(value);

    if (passwordError) {
      setPasswordError("");
    }

    if (authError) {
      setAuthError("");
    }
  };

  /* handle login */

  const handleLogin = async (intendedTab = selectedRoleTab) => {
    if (isLoading) {
      return;
    }

    const emailValidationError = validateEmail(email);

    const passwordValidationError = validatePassword(password);

    setEmailError(emailValidationError);

    setPasswordError(passwordValidationError);

    setAuthError("");

    if (emailValidationError || passwordValidationError) {
      return;
    }

    setIsLoading(true);

    try {
      const { user, token } = await loginRequest({
        email: email.trim(),
        password,
        rememberMe,
      });
      const normalizedRole =
        user.role === "HEAD_COUNSELLOR" ? "COUNSELLOR" : user.role;

      const expectedTabByRole = {
        ADMIN: "admin",
        COUNSELLOR: "counsellor",
      };

      if (expectedTabByRole[normalizedRole] !== intendedTab) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("solmento_token");
        localStorage.removeItem("user");
        localStorage.removeItem("solmento_token");
        try {
          await logoutRequest();
        } catch {
          // ignore cleanup errors
        }
        setAuthError("Please select correct role and try again.");
        return;
      }

      const authenticatedUser = {
        ...user,
        role: normalizedRole,
        isAuthenticated: true,
        rememberMe,
      };
      sessionStorage.setItem("user", JSON.stringify(authenticatedUser));
      if (token) {
        sessionStorage.setItem("solmento_token", token);
      }
      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(authenticatedUser));
        if (token) {
          localStorage.setItem("solmento_token", token);
        }
      }
      const redirectByRole = {
        ADMIN: "/app/dashboard",
        COUNSELLOR: "/app/counsellors/dashboard",
      };
      navigate(redirectByRole[normalizedRole] || "/app/dashboard", {
        replace: true,
      });
    } catch (error) {
      setAuthError(error.message || "Unable to sign in right now.");
    } finally {
      setIsLoading(false);
    }
  };

  /* forgot password */

  const handleForgotPassword = () => {
    navigate("/auth/forget-password");
  };

  /* register */

  const handleRegister = () => {
    navigate("/auth/register");
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-100 lg:h-screen lg:overflow-hidden">
      <div className="grid min-h-screen lg:h-full w-full lg:grid-cols-2">
        {/* left section */}

        <section className="relative hidden lg:block h-full overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-blue-100">
          <div className="relative flex h-full flex-col justify-between px-6 py-4 xl:px-10 xl:py-6">
            {/* brand */}

            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-500
                  shadow-lg
                  shadow-blue-500/20
                "
              >
                <Sparkles className="h-5 w-5 text-white" />
              </div>

              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900 xl:text-xl">
                  SOLMENTO
                  <span className="text-blue-500"> AI</span>
                </h1>

                <p className="text-[11px] text-slate-500 xl:text-xs">
                  Intelligent university management
                </p>
              </div>
            </div>

            {/* hero content */}

            <div className="flex flex-1 flex-col justify-center py-2 xl:py-4">
              {/* badge */}

              <div
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-blue-100
                  bg-white
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  text-blue-600
                  shadow-sm
                "
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI-powered university platform
              </div>

              {/* heading */}

              <h2
                className="
                  mt-3
                  max-w-xl
                  text-3xl
                  font-bold
                  leading-tight
                  tracking-tight
                  text-slate-900
                  xl:mt-4
                  xl:text-4xl
                  2xl:text-5xl
                "
              >
                Smart University.
                <br />
                Smarter <span className="text-blue-500">Future.</span>
              </h2>

              <p
                className="
                  mt-2.5
                  max-w-lg
                  text-sm
                  leading-relaxed
                  text-slate-600
                  xl:mt-3
                  xl:text-base
                "
              >
                Manage users, roles, conversations and university operations
                seamlessly with SOLMENTO AI.
              </p>

              {/* dashboard illustration */}

              <div className="relative mt-4 h-[200px] max-w-xl xl:mt-6 xl:h-[240px]">
                {/* dashboard glow */}

                <div
                  className="
                    absolute
                    bottom-2
                    left-1/2
                    h-36
                    w-64
                    -translate-x-1/2
                    rounded-full
                    bg-blue-200/50
                    blur-3xl
                  "
                />

                {/* floating graduation */}

                <div
                  className="
                    absolute
                    left-2
                    top-3
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-500
                    text-white
                    shadow-lg
                    shadow-blue-500/20
                    animate-bounce
                    xl:h-11
                    xl:w-11
                  "
                >
                  <GraduationCap className="h-5 w-5" />
                </div>

                {/* floating users */}

                <div
                  className="
                    absolute
                    right-14
                    top-1
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-500
                    text-white
                    shadow-lg
                    shadow-emerald-500/20
                    animate-pulse
                    xl:h-11
                    xl:w-11
                  "
                >
                  <Users className="h-5 w-5" />
                </div>

                {/* floating analytics */}

                <div
                  className="
                    absolute
                    right-0
                    top-14
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-violet-500
                    text-white
                    shadow-lg
                    shadow-violet-500/20
                    xl:h-11
                    xl:w-11
                  "
                >
                  <BarChart3 className="h-5 w-5" />
                </div>

                {/* dashboard */}

                <div
                  className="
                    absolute
                    bottom-0
                    left-1/2
                    w-[260px]
                    -translate-x-1/2
                    xl:w-[310px]
                  "
                >
                  {/* screen */}

                  <div
                    className="
                      rounded-t-2xl
                      border-[6px]
                      border-slate-800
                      bg-white
                      p-2.5
                      shadow-2xl
                    "
                  >
                    {/* top bar */}

                    <div className="flex items-center justify-between">
                      <div className="h-2 w-16 rounded-full bg-blue-200" />

                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                      </div>
                    </div>

                    {/* stats */}

                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      <div className="rounded-lg bg-blue-50 p-1.5">
                        <p className="text-[7px] text-slate-400">Students</p>

                        <p className="mt-0.5 text-xs font-bold text-slate-800">
                          24,536
                        </p>
                      </div>

                      <div className="rounded-lg bg-emerald-50 p-1.5">
                        <p className="text-[7px] text-slate-400">Courses</p>

                        <p className="mt-0.5 text-xs font-bold text-slate-800">
                          1,256
                        </p>
                      </div>

                      <div className="rounded-lg bg-violet-50 p-1.5">
                        <p className="text-[7px] text-slate-400">Faculty</p>

                        <p className="mt-0.5 text-xs font-bold text-slate-800">
                          856
                        </p>
                      </div>
                    </div>

                    {/* chart */}

                    <div className="mt-2 flex h-16 xl:h-20 items-end gap-1.5 rounded-lg bg-slate-50 px-2.5 pb-1.5 pt-2">
                      <div className="h-4 flex-1 rounded-t bg-blue-200" />
                      <div className="h-7 flex-1 rounded-t bg-blue-300" />
                      <div className="h-5 flex-1 rounded-t bg-blue-300" />
                      <div className="h-9 flex-1 rounded-t bg-blue-400" />
                      <div className="h-7 flex-1 rounded-t bg-blue-400" />
                      <div className="h-12 flex-1 rounded-t bg-blue-500" />
                      <div className="h-10 flex-1 rounded-t bg-blue-500" />
                    </div>
                  </div>

                  {/* laptop base */}

                  <div className="mx-auto h-2.5 w-[290px] xl:w-[330px] rounded-b-xl bg-slate-700" />

                  <div className="mx-auto h-1 w-20 rounded-b-full bg-slate-500" />
                </div>
              </div>
            </div>

            {/* feature cards */}

            <div className="grid grid-cols-3 gap-2.5 xl:gap-3">
              <div
                className="
                  rounded-xl
                  border
                  border-white
                  bg-white/80
                  p-2.5
                  shadow-sm
                  backdrop-blur
                  xl:p-3
                "
              >
                <ShieldCheck className="h-4 w-4 text-blue-500" />

                <p className="mt-1.5 text-xs font-semibold text-slate-800">
                  Secure
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Enterprise security
                </p>
              </div>

              <div
                className="
                  rounded-xl
                  border
                  border-white
                  bg-white/80
                  p-2.5
                  shadow-sm
                  backdrop-blur
                  xl:p-3
                "
              >
                <BarChart3 className="h-4 w-4 text-blue-500" />

                <p className="mt-1.5 text-xs font-semibold text-slate-800">
                  Smart Insights
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  AI analytics
                </p>
              </div>

              <div
                className="
                  rounded-xl
                  border
                  border-white
                  bg-white/80
                  p-2.5
                  shadow-sm
                  backdrop-blur
                  xl:p-3
                "
              >
                <Building2 className="h-4 w-4 text-blue-500" />

                <p className="mt-1.5 text-xs font-semibold text-slate-800">
                  Scalable
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Built for universities
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* right section */}

        <section className="flex min-h-screen lg:min-h-0 lg:h-full w-full flex-col items-center overflow-y-auto bg-white px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-5">
          <div className="my-auto flex w-full max-w-md xl:max-w-lg flex-col">
              {/* mobile branding */}

              <div className="mb-3 flex items-center justify-center gap-2 lg:hidden">
                <div
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-500
                  "
                >
                  <Sparkles className="h-4 w-4 text-white" />
                </div>

                <span className="text-base font-bold text-slate-900 sm:text-lg">
                  SOLMENTO
                  <span className="text-blue-500"> AI</span>
                </span>
              </div>

              {/* login card */}

              <Card
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-xl
                  shadow-slate-200/60
                  sm:rounded-3xl
                  sm:shadow-2xl
                "
              >
                <Tabs
                  value={selectedRoleTab}
                  onValueChange={(val) => {
                    setSelectedRoleTab(val);
                    setAuthError("");
                  }}
                  className="w-full"
                >
                  {/* role tabs */}

                  <div className="px-5 pt-3.5 sm:px-6 sm:pt-4">
                    <TabsList
                      className="
                        grid
                        h-9.5
                        w-full
                        grid-cols-2
                        rounded-xl
                        bg-slate-100
                        p-1
                        sm:h-10
                      "
                    >
                      <TabsTrigger
                        value="admin"
                        disabled={isLoading}
                        className="
                          cursor-pointer
                          rounded-lg
                          text-xs
                          font-semibold
                          text-slate-500
                          transition-all
                          duration-200
                          data-active:bg-blue-500
                          data-active:text-white
                          data-active:hover:bg-blue-500
                          data-active:hover:text-white
                          data-active:shadow-sm
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                          sm:text-sm
                        "
                      >
                        Admin
                      </TabsTrigger>

                      <TabsTrigger
                        value="counsellor"
                        disabled={isLoading}
                        className="
                          cursor-pointer
                          rounded-lg
                          text-xs
                          font-semibold
                          text-slate-500
                          transition-all
                          duration-200
                          data-active:bg-blue-500
                          data-active:text-white
                          data-active:hover:bg-blue-500
                          data-active:hover:text-white
                          data-active:shadow-sm
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                          sm:text-sm
                        "
                      >
                        Counsellor
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* admin */}

                  <TabsContent value="admin" className="m-0">
                    <LoginContent
                      role="Admin"
                      description="Sign in to access the Admin dashboard."
                      icon={<UserRound className="h-4.5 w-4.5 text-blue-500 sm:h-5 sm:w-5" />}
                      email={email}
                      password={password}
                      showPassword={showPassword}
                      rememberMe={rememberMe}
                      emailError={emailError}
                      passwordError={passwordError}
                      authError={authError}
                      isLoading={isLoading}
                      onEmailChange={handleEmailChange}
                      onPasswordChange={handlePasswordChange}
                      onTogglePassword={() =>
                        setShowPassword((previous) => !previous)
                      }
                      onRememberMeChange={setRememberMe}
                      onLogin={() => handleLogin("admin")}
                      onForgotPassword={handleForgotPassword}
                      onRegister={handleRegister}
                    />
                  </TabsContent>

                  {/* counsellor */}

                  <TabsContent value="counsellor" className="m-0">
                    <LoginContent
                      role="Counsellor"
                      description="Sign in to access the Counsellor dashboard."
                      icon={<Users className="h-4.5 w-4.5 text-blue-500 sm:h-5 sm:w-5" />}
                      email={email}
                      password={password}
                      showPassword={showPassword}
                      rememberMe={rememberMe}
                      emailError={emailError}
                      passwordError={passwordError}
                      authError={authError}
                      isLoading={isLoading}
                      onEmailChange={handleEmailChange}
                      onPasswordChange={handlePasswordChange}
                      onTogglePassword={() =>
                        setShowPassword((previous) => !previous)
                      }
                      onRememberMeChange={setRememberMe}
                      onLogin={() => handleLogin("counsellor")}
                      onForgotPassword={handleForgotPassword}
                      onRegister={handleRegister}
                    />
                  </TabsContent>
                </Tabs>

                {/* security information */}

                <div className="px-5 pb-2 sm:px-6 sm:pb-2.5">
                  <div
                    className="
                      rounded-xl
                      border
                      border-blue-100
                      bg-blue-50/70
                      px-3
                      py-1.5
                      sm:rounded-xl
                      sm:px-3.5
                      sm:py-2
                    "
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div
                        className="
                          flex
                          h-7.5
                          w-7.5
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-white
                          shadow-xs
                          sm:h-8
                          sm:w-8
                        "
                      >
                        <LockKeyhole className="h-3.5 w-3.5 text-blue-500 sm:h-4 sm:w-4" />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          Secure Login
                        </p>

                        <p className="text-[10.5px] leading-tight text-slate-500 sm:text-[11px] sm:leading-normal">
                          Your account is protected with advanced security.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* security footer */}

                <div
                  className="
                    border-t
                    border-slate-100
                    bg-slate-50
                    px-5
                    py-1.5
                    sm:px-6
                    sm:py-1.5
                  "
                >
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />

                    <p className="text-[10.5px] text-slate-500 sm:text-[11px]">
                      Secure login protected by advanced security.
                    </p>
                  </div>
                </div>
              </Card>

              {/* footer */}

              <p className="mt-2 text-center text-[10px] text-slate-400 sm:mt-2.5 sm:text-[11px]">
                © 2026 SOLMENTO AI. All rights reserved.
              </p>
            </div>
        </section>
      </div>
    </div>
  );
}

/* login content */

function LoginContent({
  role,
  description,
  icon,
  email,
  password,
  showPassword,
  rememberMe,
  emailError,
  passwordError,
  authError,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onRememberMeChange,
  onLogin,
  onForgotPassword,
  onRegister,
}) {
  return (
    <>
      <CardHeader className="px-5 pb-1.5 pt-3 sm:px-6 sm:pt-3.5">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-blue-50
              sm:h-10
              sm:w-10
            "
          >
            {icon}
          </div>

          <div>
            <CardTitle className="text-xl font-bold text-slate-900 sm:text-2xl">
              Welcome Back!
            </CardTitle>

            <CardDescription className="mt-0.5 text-xs sm:text-sm">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-2.5 sm:px-6 sm:pb-3">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onLogin();
          }}
          className="space-y-2.5 sm:space-y-3"
        >
          {/* authentication error */}

          {authError && (
            <div
              className="
                rounded-lg
                border
                border-red-200
                bg-red-50
                px-3.5
                py-2
                text-xs
                text-red-600
                sm:px-4
                sm:py-2.5
                sm:text-sm
              "
              role="alert"
            >
              {authError}
            </div>
          )}

          {/* email */}

          <div className="space-y-1 sm:space-y-1.5">
            <Label
              htmlFor={`${role}-email`}
              className="text-xs font-semibold text-slate-700 sm:text-sm"
            >
              Email Address
            </Label>

            <div className="relative">
              <Mail
                className="
                  pointer-events-none
                  absolute
                  left-3.5
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <Input
                id={`${role}-email`}
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={onEmailChange}
                disabled={isLoading}
                className={`
                  h-9.5
                  rounded-xl
                  border-slate-200
                  pl-10
                  pr-4
                  text-xs
                  shadow-sm
                  transition
                  focus-visible:border-blue-400
                  focus-visible:ring-blue-100
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  sm:h-10
                  sm:text-sm
                  ${
                    emailError
                      ? "border-red-500 focus-visible:ring-red-100"
                      : ""
                  }
                `}
              />
            </div>

            {emailError && <p className="text-xs text-red-500">{emailError}</p>}
          </div>

          {/* password */}

          <div className="space-y-1 sm:space-y-1.5">
            <Label
              htmlFor={`${role}-password`}
              className="text-xs font-semibold text-slate-700 sm:text-sm"
            >
              Password
            </Label>

            <div className="relative">
              <LockKeyhole
                className="
                  pointer-events-none
                  absolute
                  left-3.5
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <Input
                id={`${role}-password`}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={onPasswordChange}
                disabled={isLoading}
                className={`
                  h-9.5
                  rounded-xl
                  border-slate-200
                  pl-10
                  pr-10
                  text-xs
                  shadow-sm
                  transition
                  focus-visible:border-blue-400
                  focus-visible:ring-blue-100
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  sm:h-10
                  sm:text-sm
                  ${
                    passwordError
                      ? "border-red-500 focus-visible:ring-red-100"
                      : ""
                  }
                `}
              />

              <button
                type="button"
                onClick={onTogglePassword}
                disabled={isLoading}
                className="
                  absolute
                  right-2.5
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
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {passwordError && (
              <p className="text-xs text-red-500">{passwordError}</p>
            )}
          </div>

          {/* login options */}

          <div className="flex items-center justify-between gap-4">
            <label
              className={`
                flex
                items-center
                gap-2
                ${
                  isLoading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                }
              `}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                disabled={isLoading}
                onChange={(event) => onRememberMeChange(event.target.checked)}
                className="
                  h-3.5
                  w-3.5
                  cursor-pointer
                  rounded
                  border-slate-300
                  accent-blue-500
                  disabled:cursor-not-allowed
                  sm:h-4
                  sm:w-4
                "
              />

              <span className="text-xs text-slate-600 sm:text-sm">
                Remember me
              </span>
            </label>

            <button
              type="button"
              onClick={onForgotPassword}
              disabled={isLoading}
              className="
                cursor-pointer
                text-xs
                font-medium
                text-blue-500
                transition
                hover:text-blue-600
                hover:underline
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:text-sm
              "
            >
              Forgot Password?
            </button>
          </div>

          {/* login button */}

          <Button
            type="submit"
            disabled={isLoading}
            className="
              group
              relative
              h-9.5
              w-full
              cursor-pointer
              rounded-xl
              bg-blue-500
              px-4
              text-xs
              font-semibold
              text-white
              shadow-md
              shadow-blue-500/20
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:bg-blue-600
              hover:shadow-lg
              hover:shadow-blue-500/25
              disabled:cursor-not-allowed
              disabled:opacity-70
              disabled:hover:translate-y-0
              sm:h-10.5
              sm:px-5
              sm:text-sm
            "
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin sm:h-5 sm:w-5" />

                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Login to Dashboard</span>

                <ArrowRight
                  className="
                    absolute
                    right-3.5
                    h-4
                    w-4
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                    sm:right-4
                    sm:h-5
                    sm:w-5
                  "
                />
              </>
            )}
          </Button>

          {/* divider */}

          <div className="flex items-center gap-3 py-0 sm:gap-4">
            <div className="h-px flex-1 bg-slate-200" />

            <span className="text-[11px] font-medium text-slate-400 sm:text-xs">
              or
            </span>

            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* register link */}

          <div className="text-center">
            <span className="text-xs text-slate-500 sm:text-sm">
              Don't have an account?
            </span>{" "}
            <button
              type="button"
              onClick={onRegister}
              disabled={isLoading}
              className="
                cursor-pointer
                text-xs
                font-medium
                text-blue-500
                transition
                hover:text-blue-600
                hover:underline
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:text-sm
              "
            >
              Register
            </button>
          </div>
        </form>
      </CardContent>
    </>
  );
}
