import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <SignUp
        path="/signup"
        routing="path"
        signInUrl="/signin"
        afterSignUpUrl="/dashboard"
      />
    </div>
  );
}
