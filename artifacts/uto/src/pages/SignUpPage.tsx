import { SignUp } from "@clerk/react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const utoLogo = `${import.meta.env.BASE_URL}uto-logo.png`;

export default function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-stage px-4 py-10">
      <a
        href={basePath || "/"}
        className="mb-6 inline-flex items-center justify-center"
        aria-label="UTO home"
      >
        <img
          src={utoLogo}
          alt="UTO"
          className="h-20 w-auto"
          draggable={false}
        />
      </a>
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={basePath || "/"}
      />
    </div>
  );
}
