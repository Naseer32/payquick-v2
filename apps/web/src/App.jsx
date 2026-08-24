import { useEffect, useState } from "react";

import Dashboard from "./pages/Dashboard.jsx";
import Invoices from "./pages/Invoices.jsx";
import Checkout from "./pages/Checkout.jsx";
import Customers from "./pages/Customers.jsx";
import Payments from "./pages/Payments.jsx";
import WalletButton from "./components/WalletButton.jsx";

export default function App() {
  const [merchant, setMerchant] = useState(null);

  const [activeSection, setActiveSection] = useState("dashboard");

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("payquick_theme") === "dark";
  });

  const path = window.location.pathname;

  useEffect(() => {
    localStorage.setItem(
      "payquick_theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  if (path.startsWith("/pay/")) {
    const checkoutToken = path.slice("/pay/".length);

    return (
      <main
        style={{
          minHeight: "100vh",
          background: darkMode ? "#0f172a" : "#ffffff",
          color: darkMode ? "#f8fafc" : "#0f172a"
        }}
      >
        <Checkout checkoutToken={checkoutToken} />
      </main>
    );
  }

  const theme = darkMode
    ? {
        background: "#0f172a",
        surface: "#111827",
        surfaceHover: "#1e293b",
        text: "#f8fafc",
        muted: "#94a3b8",
        border: "#334155",
        primary: "#3b82f6"
      }
    : {
        background: "#f8fafc",
        surface: "#ffffff",
        surfaceHover: "#f1f5f9",
        text: "#0f172a",
        muted: "#64748b",
        border: "#e2e8f0",
        primary: "#2563eb"
      };

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
        return <Dashboard merchant={merchant} />;
    }
  }

  const navigation = [
    {
      id: "dashboard",
      label: "Dashboard"
    },
    {
      id: "invoices",
      label: "Invoices"
    },
    {
      id: "payments",
      label: "Payments"
    },
    {
      id: "customers",
      label: "Customers"
    }
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.background,
        color: theme.text,
        transition:
          "background 0.2s ease, color 0.2s ease"
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: theme.surface,
          borderBottom: `1px solid ${theme.border}`,
          padding: "14px 20px"
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap"
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: "22px"
              }}
            >
              PayQuick
            </h1>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setDarkMode(
                    (current) => !current
                  )
                }
                title={
                  darkMode
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
                style={{
                  border: `1px solid ${theme.border}`,
                  background: theme.surface,
                  color: theme.text,
                  borderRadius: "9px",
                  padding: "9px 11px",
                  cursor: "pointer",
                  fontSize: "16px"
                }}
              >
                {darkMode ? "☀️" : "🌙"}
              </button>

              <WalletButton
                onAuthenticated={setMerchant}
              />
            </div>
          </div>

          <nav
            style={{
              display: "flex",
              gap: "6px",
              overflowX: "auto",
              marginTop: "14px",
              paddingBottom: "2px"
            }}
          >
            {navigation.map((item) => {
              const active =
                activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setActiveSection(item.id)
                  }
                  style={{
                    border: "none",
                    borderRadius: "8px",
                    padding: "9px 14px",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    background: active
                      ? theme.primary
                      : "transparent",
                    color: active
                      ? "#ffffff"
                      : theme.muted,
                    fontWeight: active
                      ? "600"
                      : "500"
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "24px 0"
        }}
      >
        {renderSection()}
      </div>
    </main>
  );
}
