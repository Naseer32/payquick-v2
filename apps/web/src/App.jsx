import { useEffect, useState } from "react";

import Landing from "./pages/Landing.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Invoices from "./pages/Invoices.jsx";
import Checkout from "./pages/Checkout.jsx";
import Customers from "./pages/Customers.jsx";
import Payments from "./pages/Payments.jsx";
import WalletButton from "./components/WalletButton.jsx";

export default function App() {
  const [merchant, setMerchant] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");

  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname;

    if (path.startsWith("/pay/")) return "checkout";
    if (path === "/dashboard") return "dashboard";
    if (path === "/invoices") return "invoices";
    if (path === "/payments") return "payments";
    if (path === "/customers") return "customers";

    return "landing";
  });

  const [checkoutToken] = useState(() => {
    const path = window.location.pathname;

    if (path.startsWith("/pay/")) {
      return path.slice("/pay/".length);
    }

    return "";
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("payquick_theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem(
      "payquick_theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  function navigate(page) {
    setCurrentPage(page);

    if (page === "landing") {
      window.history.pushState({}, "", "/");
      return;
    }

    setActiveSection(page);
    window.history.pushState({}, "", `/${page}`);
  }

  useEffect(() => {
    function handlePopState() {
      const path = window.location.pathname;

      if (path === "/") {
        setCurrentPage("landing");
        return;
      }

      if (path === "/dashboard") {
        setCurrentPage("dashboard");
        setActiveSection("dashboard");
        return;
      }

      if (path === "/invoices") {
        setCurrentPage("invoices");
        setActiveSection("invoices");
        return;
      }

      if (path === "/payments") {
        setCurrentPage("payments");
        setActiveSection("payments");
        return;
      }

      if (path === "/customers") {
        setCurrentPage("customers");
        setActiveSection("customers");
      }
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };
  }, []);

  if (currentPage === "checkout") {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: darkMode
            ? "#0a0e1a"
            : "#f8fafc",
          color: darkMode
            ? "#f8fafc"
            : "#0f172a"
        }}
      >
        <Checkout checkoutToken={checkoutToken} />
      </main>
    );
  }

  if (currentPage === "landing") {
    return (
      <Landing
        onGetStarted={() => navigate("dashboard")}
      />
    );
  }

  const theme = darkMode
    ? {
        background: "#0a0e1a",
        sidebar: "#0d1321",
        surface: "#111827",
        surfaceHover: "#172033",
        text: "#f8fafc",
        muted: "#94a3b8",
        border: "#202b3d",
        primary: "#3b82f6",
        active: "#182640"
      }
    : {
        background: "#f8fafc",
        sidebar: "#ffffff",
        surface: "#ffffff",
        surfaceHover: "#f1f5f9",
        text: "#0f172a",
        muted: "#64748b",
        border: "#e2e8f0",
        primary: "#2563eb",
        active: "#eff6ff"
      };

  const navigation = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "▦"
    },
    {
      id: "invoices",
      label: "Invoices",
      icon: "▤"
    },
    {
      id: "customers",
      label: "Customers",
      icon: "♙"
    },
    {
      id: "payments",
      label: "Payments",
      icon: "↗"
    },
    {
      id: "webhooks",
      label: "Webhooks",
      icon: "◇"
    },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙"
    }
  ];

  function handleNavigation(section) {
    if (
      section === "webhooks" ||
      section === "settings"
    ) {
      return;
    }

    setActiveSection(section);
    setCurrentPage(section);

    window.history.pushState(
      {},
      "",
      `/${section}`
    );
  }

  function renderSection() {
    switch (activeSection) {
      case "invoices":
        return <Invoices merchant={merchant} />;

      case "payments":
        return <Payments merchant={merchant} />;

      case "customers":
        return <Customers merchant={merchant} />;

      case "dashboard":
      default:
        return (
          <Dashboard
            merchant={merchant}
            darkMode={darkMode}
          />
        );
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.background,
        color: theme.text,
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        transition:
          "background 0.2s ease, color 0.2s ease"
      }}
    >
      <aside
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          width: "230px",
          background: theme.sidebar,
          borderRight:
            `1px solid ${theme.border}`,
          padding: "22px 14px",
          boxSizing: "border-box",
          zIndex: 200,
          display: "flex",
          flexDirection: "column"
        }}
      >
        <button
          type="button"
          onClick={() => navigate("dashboard")}
          style={{
            border: "none",
            background: "transparent",
            color: theme.text,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "4px 10px",
            marginBottom: "30px",
            textAlign: "left"
          }}
        >
          <span
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              background: theme.primary,
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "800",
              fontSize: "18px"
            }}
          >
            P
          </span>

          <span
            style={{
              fontSize: "19px",
              fontWeight: "800",
              letterSpacing: "-0.4px"
            }}
          >
            PayQuick
          </span>
        </button>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "5px"
          }}
        >
          {navigation.map((item) => {
            const active =
              activeSection === item.id;

            const disabled =
              item.id === "webhooks" ||
              item.id === "settings";

            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                onClick={() =>
                  handleNavigation(item.id)
                }
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: "10px",
                  padding: "11px 12px",
                  background: active
                    ? theme.active
                    : "transparent",
                  color: active
                    ? theme.primary
                    : disabled
                    ? theme.border
                    : theme.muted,
                  cursor: disabled
                    ? "default"
                    : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: active
                    ? "650"
                    : "500",
                  opacity: disabled ? 0.6 : 1
                }}
              >
                <span
                  style={{
                    width: "22px",
                    textAlign: "center",
                    fontSize: "17px"
                  }}
                >
                  {item.icon}
                </span>

                {item.label}

                {disabled && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "9px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}
                  >
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div
          style={{
            marginTop: "auto",
            paddingTop: "18px",
            borderTop:
              `1px solid ${theme.border}`
          }}
        >
          <button
            type="button"
            onClick={() =>
              setDarkMode(
                (current) => !current
              )
            }
            style={{
              width: "100%",
              border:
                `1px solid ${theme.border}`,
              background: theme.surface,
              color: theme.text,
              borderRadius: "10px",
              padding: "10px 12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "13px"
            }}
          >
            <span>
              {darkMode
                ? "☀️ Light mode"
                : "🌙 Dark mode"}
            </span>

            <span
              style={{
                color: theme.muted
              }}
            >
              {darkMode ? "On" : "Off"}
            </span>
          </button>
        </div>
      </aside>

      <div
        style={{
          marginLeft: "230px",
          minHeight: "100vh"
        }}
      >
        <header
          style={{
            height: "72px",
            background: theme.surface,
            borderBottom:
              `1px solid ${theme.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            boxSizing: "border-box",
            position: "sticky",
            top: 0,
            zIndex: 100
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: theme.muted
            }}
          >
            {navigation.find(
              (item) =>
                item.id === activeSection
            )?.label || "Dashboard"}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}
          >
            <WalletButton
              onAuthenticated={setMerchant}
            />
          </div>
        </header>

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 12px"
          }}
        >
          {renderSection()}
        </div>
      </div>
    </main>
  );
}
