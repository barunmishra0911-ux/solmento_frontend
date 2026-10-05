import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerRequest } from "@/lib/authApi";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  CheckCircle,
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

export default function Register() {
  const navigate = useNavigate();

  /* states */

  const [companyName, setCompanyName] = useState("");

  const [fullName, setFullName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [plan, setPlan] = useState("");

  const [termsAccepted, setTermsAccepted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [isRegistered, setIsRegistered] = useState(false);

  const [verificationToken, setVerificationToken] = useState("");

  const [companyError, setCompanyError] = useState("");

  const [nameError, setNameError] = useState("");

  const [emailError, setEmailError] = useState("");

  const [passwordError, setPasswordError] = useState("");

  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [termsError, setTermsError] = useState("");

  /* validate company */

  const validateCompanyName = (value) => {
    if (!value.trim()) {
      return "Company name is required.";
    }

    if (value.trim().length < 2) {
      return "Company name must be at least 2 characters.";
    }

    return "";
  };

  /* validate full name */

  const validateFullName = (value) => {
    if (!value.trim()) {
      return "Full name is required.";
    }

    if (value.trim().length < 2) {
      return "Please enter your full name.";
    }

    return "";
  };

  /* validate email */

  const validateEmail = (value) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!value.trim()) {
      return "Work email is required.";
    }

    if (!emailPattern.test(value.trim())) {
      return "Please enter a valid work email address.";
    }

    return "";
  };

  /* validate password */

  const validatePassword = (value) => {
    if (!value) {
      return "Password is required.";
    }

    if (value.length < 8) {
      return "Password must be at least 8 characters.";
    }

    return "";
  };

  /* validate confirm password */

  const validateConfirmPassword = (value) => {
    if (!value) {
      return "Please confirm your password.";
    }

    if (value !== password) {
      return "Passwords do not match.";
    }

    return "";
  };

  /* password strength */

  const passwordStrength = useMemo(() => {
    let score = 0;

    if (password.length >= 8) {
      score++;
    }

    if (/[A-Z]/.test(password)) {
      score++;
    }

    if (/[0-9]/.test(password)) {
      score++;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score++;
    }

    if (score === 0) {
      return {
        label: "Enter a password",
        width: "w-0",
        text: "text-slate-400",
        bar: "bg-slate-200",
      };
    }

    if (score === 1) {
      return {
        label: "Weak password",
        width: "w-1/4",
        text: "text-red-500",
        bar: "bg-red-500",
      };
    }

    if (score === 2) {
      return {
        label: "Fair password",
        width: "w-2/4",
        text: "text-orange-500",
        bar: "bg-orange-500",
      };
    }

    if (score === 3) {
      return {
        label: "Good password",
        width: "w-3/4",
        text: "text-yellow-600",
        bar: "bg-yellow-500",
      };
    }

    return {
      label: "Strong password",
      width: "w-full",
      text: "text-emerald-500",
      bar: "bg-emerald-500",
    };
  }, [password]);

  /* form status */

  const isFormValid =
    validateCompanyName(companyName) === "" &&
    validateFullName(fullName) === "" &&
    validateEmail(email) === "" &&
    validatePassword(password) === "" &&
    validateConfirmPassword(confirmPassword) === "" &&
    termsAccepted;

  /* handle company */

  const handleCompanyChange = (event) => {
    const value = event.target.value;

    setCompanyName(value);

    if (companyError) {
      setCompanyError("");
    }
  };

  /* handle full name */

  const handleNameChange = (event) => {
    const value = event.target.value;

    setFullName(value);

    if (nameError) {
      setNameError("");
    }
  };

  /* handle email */

  const handleEmailChange = (event) => {
    const value = event.target.value;

    setEmail(value);

    if (emailError) {
      setEmailError("");
    }
  };

  /* handle password */

  const handlePasswordChange = (event) => {
    const value = event.target.value;

    setPassword(value);

    if (passwordError) {
      setPasswordError("");
    }

    if (confirmPassword) {
      setConfirmPasswordError(
        value === confirmPassword ? "" : "Passwords do not match.",
      );
    }
  };

  /* handle confirm password */

  const handleConfirmPasswordChange = (event) => {
    const value = event.target.value;

    setConfirmPassword(value);

    if (confirmPasswordError) {
      setConfirmPasswordError("");
    }
  };

  /* handle terms */

  const handleTermsChange = (event) => {
    const checked = event.target.checked;

    setTermsAccepted(checked);

    if (checked) {
      setTermsError("");
    }
  };

  /* handle register */

  const handleRegister = async (event) => {
    event.preventDefault();

    const currentCompanyError = validateCompanyName(companyName);

    const currentNameError = validateFullName(fullName);

    const currentEmailError = validateEmail(email);

    const currentPasswordError = validatePassword(password);

    const currentConfirmPasswordError =
      validateConfirmPassword(confirmPassword);

    setCompanyError(currentCompanyError);

    setNameError(currentNameError);

    setEmailError(currentEmailError);

    setPasswordError(currentPasswordError);

    setConfirmPasswordError(currentConfirmPasswordError);

    setTermsError(
      termsAccepted ? "" : "You must accept the terms to continue.",
    );

    if (
      currentCompanyError ||
      currentNameError ||
      currentEmailError ||
      currentPasswordError ||
      currentConfirmPasswordError ||
      !termsAccepted
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerRequest({
        companyName: companyName.trim(),
        name: fullName.trim(),
        email: email.trim(),
        password,
        termsAccepted,
        plan,
      });
      setVerificationToken(result.verificationToken || "");

      /* save registration data for demo */

      const registrationData = {
        companyName: companyName.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        plan,
        role: result.user.role,
        tenantId: result.user.tenantId,
      };

      sessionStorage.setItem(
        "registrationData",
        JSON.stringify(registrationData),
      );

      /* show email confirmation */

      setIsRegistered(true);
    } catch (error) {
      setEmailError(error.message || "Unable to create your workspace right now.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-100">
      <div className="grid h-screen min-h-0 lg:grid-cols-2">
        {/* left section */}

        <section
          className="
            relative
            hidden
            h-screen 
            overflow-hidden
            bg-gradient-to-br
            from-blue-50
            via-white
            to-blue-100
            lg:block
          "
        >
          <div
            className="
              relative
              flex
    h-screen
              flex-col
              justify-between
              px-8
              py-7
              xl:px-12
            "
          >
            {/* brand */}

            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-11
                  w-11
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
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  SOLMENTO
                  <span className="text-blue-500"> AI</span>
                </h1>

                <p className="text-xs text-slate-500">
                  Intelligent university management
                </p>
              </div>
            </div>

            {/* hero content */}

            <div className="flex flex-1 flex-col justify-center">
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
                  py-1.5
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
                  mt-5
                  max-w-xl
                  text-4xl
                  font-bold
                  leading-tight
                  tracking-tight
                  text-slate-900
                  xl:text-5xl
                "
              >
                Build your
                <br />
                smarter <span className="text-blue-500">workspace.</span>
              </h2>

              <p
                className="
                  mt-4
                  max-w-lg
                  text-base
                  leading-7
                  text-slate-600
                  xl:text-lg
                "
              >
                Create your workspace and bring your university operations
                together with SOLMENTO AI.
              </p>

              {/* dashboard illustration */}

              <div className="relative mt-7 h-[260px] max-w-xl">
                {/* dashboard glow */}

                <div
                  className="
                    absolute
                    bottom-3
                    left-1/2
                    h-44
                    w-72
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
                    top-5
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-500
                    text-white
                    shadow-lg
                    shadow-blue-500/20
                    animate-bounce
                  "
                >
                  <GraduationCap className="h-6 w-6" />
                </div>

                {/* floating users */}

                <div
                  className="
                    absolute
                    right-16
                    top-2
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-500
                    text-white
                    shadow-lg
                    shadow-emerald-500/20
                    animate-pulse
                  "
                >
                  <Users className="h-6 w-6" />
                </div>

                {/* floating analytics */}

                <div
                  className="
                    absolute
                    right-0
                    top-20
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-violet-500
                    text-white
                    shadow-lg
                    shadow-violet-500/20
                  "
                >
                  <BarChart3 className="h-6 w-6" />
                </div>

                {/* dashboard */}

                <div
                  className="
                    absolute
                    bottom-0
                    left-1/2
                    w-[300px]
                    -translate-x-1/2
                    xl:w-[340px]
                  "
                >
                  {/* screen */}

                  <div
                    className="
                      rounded-t-2xl
                      border-[7px]
                      border-slate-800
                      bg-white
                      p-3
                      shadow-2xl
                    "
                  >
                    {/* top bar */}

                    <div className="flex items-center justify-between">
                      <div className="h-2.5 w-20 rounded-full bg-blue-200" />

                      <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-slate-200" />
                        <span className="h-2 w-2 rounded-full bg-slate-200" />
                        <span className="h-2 w-2 rounded-full bg-slate-200" />
                      </div>
                    </div>

                    {/* stats */}

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-blue-50 p-2">
                        <p className="text-[7px] text-slate-400">Students</p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          24,536
                        </p>
                      </div>

                      <div className="rounded-lg bg-emerald-50 p-2">
                        <p className="text-[7px] text-slate-400">Courses</p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          1,256
                        </p>
                      </div>

                      <div className="rounded-lg bg-violet-50 p-2">
                        <p className="text-[7px] text-slate-400">Faculty</p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          856
                        </p>
                      </div>
                    </div>

                    {/* chart */}

                    <div className="mt-3 flex h-20 items-end gap-2 rounded-lg bg-slate-50 px-3 pb-2 pt-3">
                      <div className="h-5 flex-1 rounded-t bg-blue-200" />
                      <div className="h-8 flex-1 rounded-t bg-blue-300" />
                      <div className="h-6 flex-1 rounded-t bg-blue-300" />
                      <div className="h-10 flex-1 rounded-t bg-blue-400" />
                      <div className="h-8 flex-1 rounded-t bg-blue-400" />
                      <div className="h-14 flex-1 rounded-t bg-blue-500" />
                      <div className="h-11 flex-1 rounded-t bg-blue-500" />
                    </div>
                  </div>

                  {/* laptop base */}

                  <div className="mx-auto h-3 w-[330px] rounded-b-xl bg-slate-700" />

                  <div className="mx-auto h-1.5 w-24 rounded-b-full bg-slate-500" />
                </div>
              </div>
            </div>

            {/* feature cards */}

            <div className="grid grid-cols-3 gap-3">
              <div
                className="
                  rounded-xl
                  border
                  border-white
                  bg-white/80
                  p-3
                  shadow-sm
                  backdrop-blur
                "
              >
                <ShieldCheck className="h-4 w-4 text-blue-500" />

                <p className="mt-2 text-xs font-semibold text-slate-800">
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
                  p-3
                  shadow-sm
                  backdrop-blur
                "
              >
                <BarChart3 className="h-4 w-4 text-blue-500" />

                <p className="mt-2 text-xs font-semibold text-slate-800">
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
                  p-3
                  shadow-sm
                  backdrop-blur
                "
              >
                <Building2 className="h-4 w-4 text-blue-500" />

                <p className="mt-2 text-xs font-semibold text-slate-800">
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

        <section className="h-screen min-h-0 overflow-y-auto bg-white">
          <div className="flex min-h-full items-start justify-center px-4 py-6 pb-24 sm:px-8">
            {/* register area */}

            <div className="w-full max-w-xl">
              {/* mobile branding */}

              <div className="mb-5 flex items-center justify-center gap-2 lg:hidden">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-500
                  "
                >
                  <Sparkles className="h-5 w-5 text-white" />
                </div>

                <span className="text-lg font-bold text-slate-900">
                  SOLMENTO
                  <span className="text-blue-500"> AI</span>
                </span>
              </div>

              {/* back to login */}

              <button
                type="button"
                onClick={() => navigate("/auth/login")}
                className="
                  mb-4
                  flex
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

              {isRegistered ? (
                /* registration success */

                <Card
                  className="
                    overflow-hidden
                    rounded-3xl
                    border-slate-200
                    shadow-2xl
                    shadow-slate-200/60
                  "
                >
                  <CardContent className="px-6 py-10 text-center sm:px-8">
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
                        bg-emerald-100
                      "
                    >
                      <Mail className="h-8 w-8 text-emerald-500" />
                    </div>

                    {/* success title */}

                    <h1 className="mt-6 text-2xl font-bold text-slate-900">
                      Check your email
                    </h1>

                    {/* success message */}

                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                      We've sent a verification link to{" "}
                      <span className="font-semibold text-slate-700">
                        {email}
                      </span>
                      . Please check your inbox and follow the link to verify
                      your account.
                    </p>

                    {/* email status */}

                    <div
                      className="
                        mt-6
                        rounded-2xl
                        border
                        border-blue-100
                        bg-blue-50/70
                        px-4
                        py-4
                      "
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-white
                          "
                        >
                          <CheckCircle className="h-5 w-5 text-blue-500" />
                        </div>

                        <div className="text-left">
                          <p className="text-sm font-semibold text-slate-700">
                            Verification email sent
                          </p>

                          <p className="mt-0.5 break-all text-xs text-slate-500">
                            {email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {verificationToken && (
                      <a
                        href={`/auth/verify-email/${verificationToken}`}
                        className="mt-4 inline-block text-xs font-medium text-blue-600 hover:underline"
                      >
                        Open development verification link
                      </a>
                    )}

                    {/* login button */}

                    <Button
                      type="button"
                      onClick={() => navigate("/auth/login")}
                      className="
                        mt-6
                        h-11
                        w-full
                        cursor-pointer
                        rounded-xl
                        bg-blue-500
                        font-semibold
                        text-white
                        hover:bg-blue-600
                      "
                    >
                      Go to Login
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card
                  className="
                    rounded-3xl
                    border-slate-200
                    shadow-2xl
                    shadow-slate-200/60
                  "
                >
                  {/* header */}

                  <CardHeader className="px-6 pb-4 pt-6 sm:px-8">
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-blue-50
                        "
                      >
                        <UserRound className="h-6 w-6 text-blue-500" />
                      </div>

                      <div>
                        <CardTitle className="text-2xl font-bold text-slate-900">
                          Create your account
                        </CardTitle>

                        <CardDescription className="mt-1 text-sm">
                          Create your workspace and get started with SOLMENTO
                          AI.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-6 pb-6 sm:px-8">
                    <form onSubmit={handleRegister} className="space-y-4">
                      {/* company name */}

                      <div className="space-y-2">
                        <Label
                          htmlFor="company-name"
                          className="text-sm font-semibold text-slate-700"
                        >
                          Company Name
                        </Label>

                        <div className="relative">
                          <Building2
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
                            id="company-name"
                            type="text"
                            placeholder="Enter your company name"
                            value={companyName}
                            onChange={handleCompanyChange}
                            disabled={isLoading}
                            className={`
                              h-11
                              rounded-xl
                              border-slate-200
                              pl-12
                              text-sm
                              shadow-sm
                              focus-visible:border-blue-400
                              focus-visible:ring-blue-100
                              ${companyError ? "border-red-500" : ""}
                            `}
                          />
                        </div>

                        {companyError && (
                          <p className="text-xs text-red-500">{companyError}</p>
                        )}
                      </div>

                      {/* full name */}

                      <div className="space-y-2">
                        <Label
                          htmlFor="full-name"
                          className="text-sm font-semibold text-slate-700"
                        >
                          Full Name
                        </Label>

                        <div className="relative">
                          <UserRound
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
                            id="full-name"
                            type="text"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={handleNameChange}
                            disabled={isLoading}
                            className={`
                              h-11
                              rounded-xl
                              border-slate-200
                              pl-12
                              text-sm
                              shadow-sm
                              focus-visible:border-blue-400
                              focus-visible:ring-blue-100
                              ${nameError ? "border-red-500" : ""}
                            `}
                          />
                        </div>

                        {nameError && (
                          <p className="text-xs text-red-500">{nameError}</p>
                        )}
                      </div>

                      {/* work email */}

                      <div className="space-y-2">
                        <Label
                          htmlFor="work-email"
                          className="text-sm font-semibold text-slate-700"
                        >
                          Work Email
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
                            id="work-email"
                            type="email"
                            placeholder="Enter your work email"
                            value={email}
                            onChange={handleEmailChange}
                            disabled={isLoading}
                            className={`
                              h-11
                              rounded-xl
                              border-slate-200
                              pl-12
                              text-sm
                              shadow-sm
                              focus-visible:border-blue-400
                              focus-visible:ring-blue-100
                              ${emailError ? "border-red-500" : ""}
                            `}
                          />
                        </div>

                        {emailError && (
                          <p className="text-xs text-red-500">{emailError}</p>
                        )}
                      </div>

                      {/* password */}

                      <div className="space-y-2">
                        <Label
                          htmlFor="register-password"
                          className="text-sm font-semibold text-slate-700"
                        >
                          Password
                        </Label>

                        <div className="relative">
                          <LockKeyhole
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
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
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
                              ${passwordError ? "border-red-500" : ""}
                            `}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword((previous) => !previous)
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
                              hover:text-slate-700
                            "
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>

                        {/* password strength */}

                        <div className="space-y-1.5">
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`
                                h-full
                                rounded-full
                                transition-all
                                duration-300
                                ${passwordStrength.width}
                                ${passwordStrength.bar}
                              `}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <p
                              className={`text-xs font-medium ${passwordStrength.text}`}
                            >
                              {passwordStrength.label}
                            </p>

                            <p className="text-[11px] text-slate-400">
                              Use 8+ characters
                            </p>
                          </div>
                        </div>

                        {passwordError && (
                          <p className="text-xs text-red-500">
                            {passwordError}
                          </p>
                        )}
                      </div>

                      {/* confirm password */}

                      <div className="space-y-2">
                        <Label
                          htmlFor="confirm-password"
                          className="text-sm font-semibold text-slate-700"
                        >
                          Confirm Password
                        </Label>

                        <div className="relative">
                          <LockKeyhole
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
                            placeholder="Confirm your password"
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
                              ${confirmPasswordError ? "border-red-500" : ""}
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
                              hover:text-slate-700
                            "
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>

                        {confirmPassword.length > 0 && (
                          <div
                            className={`
                              flex
                              items-center
                              gap-2
                              text-xs
                              font-medium
                              ${
                                password === confirmPassword
                                  ? "text-emerald-500"
                                  : "text-red-500"
                              }
                            `}
                          >
                            <CheckCircle2 className="h-4 w-4" />

                            {password === confirmPassword
                              ? "Passwords match"
                              : "Passwords do not match"}
                          </div>
                        )}

                        {confirmPasswordError && (
                          <p className="text-xs text-red-500">
                            {confirmPasswordError}
                          </p>
                        )}
                      </div>

                      {/* plan */}

                      <div className="space-y-2">
                        <Label
                          htmlFor="plan"
                          className="text-sm font-semibold text-slate-700"
                        >
                          Select Plan
                          <span className="ml-1 font-normal text-slate-400">
                            (optional)
                          </span>
                        </Label>

                        <select
                          id="plan"
                          value={plan}
                          onChange={(event) => setPlan(event.target.value)}
                          disabled={isLoading}
                          className="
                            h-11
                            w-full
                            cursor-pointer
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            text-sm
                            text-slate-700
                            shadow-sm
                            outline-none
                            transition
                            focus:border-blue-400
                            focus:ring-2
                            focus:ring-blue-100
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        >
                          <option value="">Choose a plan</option>

                          <option value="starter">Starter</option>

                          <option value="professional">Professional</option>

                          <option value="enterprise">Enterprise</option>
                        </select>
                      </div>

                      {/* terms */}

                      <div className="space-y-2">
                        <label
                          className={`
                            flex
                            items-start
                            gap-3
                            ${
                              isLoading
                                ? "cursor-not-allowed opacity-60"
                                : "cursor-pointer"
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={handleTermsChange}
                            disabled={isLoading}
                            className="
                              mt-0.5
                              h-4
                              w-4
                              shrink-0
                              cursor-pointer
                              rounded
                              border-slate-300
                              accent-blue-500
                            "
                          />

                          <span className="text-xs leading-5 text-slate-500">
                            I agree to the{" "}
                            <button
                              type="button"
                              className="
                                cursor-pointer
                                font-medium
                                text-blue-500
                                hover:underline
                              "
                            >
                              Terms of Service
                            </button>{" "}
                            and{" "}
                            <button
                              type="button"
                              className="
                                cursor-pointer
                                font-medium
                                text-blue-500
                                hover:underline
                              "
                            >
                              Privacy Policy
                            </button>
                            .
                          </span>
                        </label>

                        {termsError && (
                          <p className="text-xs text-red-500">{termsError}</p>
                        )}
                      </div>

                      {/* create account */}

                      <Button
                        type="submit"
                        disabled={!isFormValid || isLoading}
                        className={`
                          h-11
                          w-full
                          rounded-xl
                          font-semibold
                          text-white
                          shadow-lg
                          transition-all
                          duration-200
                          ${
                            isFormValid && !isLoading
                              ? "cursor-pointer bg-blue-500 shadow-blue-500/20 hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-xl"
                              : "cursor-not-allowed bg-slate-300 shadow-none"
                          }
                        `}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <span>Create Account</span>

                            <ArrowRight className="ml-auto h-5 w-5" />
                          </>
                        )}
                      </Button>

                      {/* login link */}

                      <div className="text-center">
                        <span className="text-sm text-slate-500">
                          Already have an account?
                        </span>{" "}
                        <button
                          type="button"
                          onClick={() => navigate("/auth/login")}
                          disabled={isLoading}
                          className="
                            cursor-pointer
                            text-sm
                            font-medium
                            text-blue-500
                            hover:text-blue-600
                            hover:underline
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          Login
                        </button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* security note */}

              <div className="mt-4 flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />

                <p className="text-xs text-slate-400">
                  Your information is securely protected.
                </p>
              </div>

              {/* footer */}

              <p className="mt-3 text-center text-[11px] text-slate-400">
                © 2026 SOLMENTO AI. All rights reserved.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
