import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <SignIn
        path="/signin"
        routing="path"
        signUpUrl="/signup"
        afterSignInUrl="/dashboard"
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}
