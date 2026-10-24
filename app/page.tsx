"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ZONES } from "@/app/data/zones";
import { AppHeader, Footer, type Tab } from "@/app/components/Chrome";
import { EASE } from "@/app/components/motion";
import { BackendProvider } from "@/app/components/BackendProvider";
import Poster from "@/app/components/Poster";
import Dashboard from "@/app/components/Dashboard";
import Win32 from "@/app/components/Win32";

export default function ForecastGuardApp() {
  const [activeTab, setActiveTab] = useState<Tab>("poster");
  const [day, setDay] = useState(4);
  const [metric, setMetric] = useState<"RAW" | "CORR" | "BUST">("BUST");
  const [selectedId, setSelectedId] = useState(ZONES[1].id);

  /* keyboard shortcuts: 1 / 2 / 3 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "1") setActiveTab("poster");
      if (e.key === "2") setActiveTab("dashboard");
      if (e.key === "3") setActiveTab("win32");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Each view is a different surface; opening one always starts at the top. */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <BackendProvider>
      <MotionConfig reducedMotion="user">
        <div className="flex min-h-screen flex-col bg-[var(--paper)] text-[var(--ink)]">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[1000] focus:bg-[var(--accent)] focus:px-3 focus:py-2 focus:font-mono-code focus:text-xs focus:text-[var(--paper)]"
        >
          Skip to content
        </a>

        <AppHeader activeTab={activeTab} onTabChange={setActiveTab} />

        <div id="main" className="flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {activeTab === "poster" ? (
                <Poster
                  day={day}
                  onDayChange={setDay}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onOpenDashboard={() => setActiveTab("dashboard")}
                  onOpenWin32={() => setActiveTab("win32")}
                />
              ) : null}

              {activeTab === "dashboard" ? (
                <Dashboard
                  day={day}
                  onDayChange={setDay}
                  metric={metric}
                  onMetricChange={setMetric}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              ) : null}

              {activeTab === "win32" ? (
                <Win32
                  day={day}
                  onDayChange={setDay}
                  metric={metric}
                  onMetricChange={setMetric}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <Footer />
      </div>
      </MotionConfig>
    </BackendProvider>
  );
}
