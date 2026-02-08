import Toast from "../components/Toast.jsx";

export default function Layout({ children }) {
  return (
    <div className="animated-mesh relative min-h-screen overflow-hidden bg-ink-950">
      <div className="noise-overlay pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(140%_120%_at_50%_-10%,rgba(255,255,255,0.05),transparent_46%),radial-gradient(120%_100%_at_50%_120%,rgba(0,0,0,0.5),transparent_52%)]" />
      <div className="mesh-orb mesh-orb-a pointer-events-none absolute" />
      <div className="mesh-orb mesh-orb-b pointer-events-none absolute" />
      <div className="mesh-orb mesh-orb-c pointer-events-none absolute" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 py-5 md:px-8 md:py-7">
        {children}
      </div>

      <Toast />
    </div>
  );
}
