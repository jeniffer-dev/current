export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="mb-10">
        <span className="text-base font-semibold tracking-widest text-foreground uppercase">
          Current
        </span>
      </div>
      <div className="w-full max-w-[360px]">
        {children}
      </div>
    </div>
  );
}
