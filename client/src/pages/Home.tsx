export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Triponic</h1>
      <p className="text-muted-foreground mb-6">
        AI-powered travel platform for agents and explorers.
      </p>
      <a
        href="/signin"
        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
      >
        Sign in to Continue
      </a>
    </div>
  );
}
