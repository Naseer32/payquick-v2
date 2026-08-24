import React from "react";

export default function Landing({ onGetStarted }) {
  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth"
    });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#0f172a",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        overflowX: "hidden"
      }}
    >
      {/* Navigation */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(248,250,252,0.94)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #e2e8f0"
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px"
          }}
        >
          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth"
              })
            }
            style={{
              border: "none",
              background: "transparent",
              color: "#0f172a",
              cursor: "pointer",
              fontSize: "21px",
              fontWeight: "800",
              padding: 0,
              flexShrink: 0
            }}
          >
            PayQuick
          </button>

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              overflowX: "auto",
              maxWidth: "100%",
              paddingBottom: "2px"
            }}
          >
            <button
              type="button"
              onClick={() => scrollTo("features")}
              style={navButtonStyle}
            >
              Features
            </button>

            <button
              type="button"
              onClick={() => scrollTo("how-it-works")}
              style={navButtonStyle}
            >
              How it works
            </button>

            <button
              type="button"
              onClick={() => scrollTo("why-arc")}
              style={navButtonStyle}
            >
              Why Arc
            </button>

            <button
              type="button"
              onClick={onGetStarted}
              style={primaryButtonStyle}
            >
              Get started
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "clamp(55px, 8vw, 90px) 20px 70px",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: "45px",
            alignItems: "center"
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "7px 12px",
                borderRadius: "999px",
                background: "#e0f2fe",
                color: "#0369a1",
                fontSize: "13px",
                fontWeight: "700",
                marginBottom: "20px"
              }}
            >
              Built on Arc
            </div>

            <h1
              style={{
                margin: 0,
                maxWidth: "720px",
                fontSize: "clamp(42px, 7vw, 76px)",
                lineHeight: "0.99",
                letterSpacing: "clamp(-2px, -0.3vw, -3px)"
              }}
            >
              Stablecoin payments made simple.
            </h1>

            <p
              style={{
                maxWidth: "650px",
                margin: "25px 0 0",
                color: "#64748b",
                fontSize: "18px",
                lineHeight: "1.7"
              }}
            >
              PayQuick gives merchants a simple way to receive stablecoin
              payments, create invoices, send payment requests, and track
              confirmed transactions from one place.
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginTop: "30px"
              }}
            >
              <button
                type="button"
                onClick={onGetStarted}
                style={{
                  ...primaryButtonStyle,
                  padding: "14px 22px",
                  fontSize: "15px"
                }}
              >
                Start accepting payments
              </button>

              <button
                type="button"
                onClick={() => scrollTo("how-it-works")}
                style={{
                  ...secondaryButtonStyle,
                  padding: "14px 22px",
                  fontSize: "15px"
                }}
              >
                See how it works
              </button>
            </div>

            <p
              style={{
                marginTop: "17px",
                color: "#94a3b8",
                fontSize: "13px"
              }}
            >
              Currently running on Arc Testnet.
            </p>
          </div>

          {/* Product preview */}
          <div
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "#0f172a",
              borderRadius: "24px",
              padding: "14px",
              boxShadow: "0 25px 65px rgba(15,23,42,0.18)"
            }}
          >
            <div
              style={{
                background: "#111827",
                borderRadius: "17px",
                padding: "clamp(18px, 4vw, 24px)",
                color: "#f8fafc"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "28px"
                }}
              >
                <strong style={{ fontSize: "18px" }}>
                  PayQuick
                </strong>

                <span
                  style={{
                    fontSize: "12px",
                    color: "#34d399",
                    whiteSpace: "nowrap"
                  }}
                >
                  ● Connected
                </span>
              </div>

              <p
                style={{
                  margin: 0,
                  color: "#94a3b8",
                  fontSize: "13px"
                }}
              >
                Total received
              </p>

              <strong
                style={{
                  display: "block",
                  marginTop: "6px",
                  fontSize: "clamp(32px, 7vw, 38px)"
                }}
              >
                50 USDC
              </strong>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "10px",
                  marginTop: "22px"
                }}
              >
                <PreviewStat value="12" label="Payments" />
                <PreviewStat value="16" label="Invoices" />
                <PreviewStat value="1" label="Customers" />
                <PreviewStat value="100%" label="Confirmed" />
              </div>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section
          style={{
            background: "#0f172a",
            color: "#f8fafc"
          }}
        >
          <div
            style={{
              maxWidth: "1180px",
              margin: "0 auto",
              padding: "75px 20px"
            }}
          >
            <p style={sectionEyebrowStyle}>THE PROBLEM</p>

            <h2 style={darkSectionTitleStyle}>
              Crypto payments should not feel complicated.
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                gap: "16px",
                marginTop: "38px"
              }}
            >
              <DarkProblem
                number="01"
                title="Wrong address"
                text="Typing or copying a long wallet address creates unnecessary risk."
              />

              <DarkProblem
                number="02"
                title="Wrong amount"
                text="Customers should know exactly what they are being asked to pay."
              />

              <DarkProblem
                number="03"
                title="No clear proof"
                text="A payment should have a verifiable transaction record."
              />
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "75px 20px"
          }}
        >
          <p style={sectionEyebrowStyle}>WHAT PAYQUICK DOES</p>

          <h2 style={sectionTitleStyle}>
            Everything a merchant needs to handle stablecoin payments.
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
              gap: "16px",
              marginTop: "38px"
            }}
          >
            <Feature
              icon="↗"
              title="Accept payments"
              text="Receive stablecoin payments directly from your customers."
            />

            <Feature
              icon="□"
              title="Create invoices"
              text="Create payment requests with the amount, currency and customer."
            />

            <Feature
              icon="↗"
              title="Track payments"
              text="Follow payment status and confirmed transaction activity."
            />

            <Feature
              icon="✓"
              title="Payment receipts"
              text="Keep a clear record of confirmed payments and transaction hashes."
            />

            <Feature
              icon="◎"
              title="Customer records"
              text="Keep customer information connected to your payment activity."
            />

            <Feature
              icon="▣"
              title="Merchant dashboard"
              text="See received funds, payments, invoices and customers in one place."
            />
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          style={{
            background: "#f1f5f9"
          }}
        >
          <div
            style={{
              maxWidth: "1180px",
              margin: "0 auto",
              padding: "75px 20px"
            }}
          >
            <p style={sectionEyebrowStyle}>HOW IT WORKS</p>

            <h2 style={sectionTitleStyle}>
              From payment request to confirmation.
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
                gap: "16px",
                marginTop: "38px"
              }}
            >
              <Step
                number="1"
                title="Create"
                text="The merchant creates an invoice or payment request."
              />

              <Step
                number="2"
                title="Pay"
                text="The customer opens the payment page and completes the payment."
              />

              <Step
                number="3"
                title="Confirm"
                text="PayQuick tracks the transaction and updates the payment status."
              />
            </div>
          </div>
        </section>

        {/* Why Arc */}
        <section
          id="why-arc"
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "75px 20px"
          }}
        >
          <p style={sectionEyebrowStyle}>WHY ARC</p>

          <h2 style={sectionTitleStyle}>
            Built for stablecoin-native payments.
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
              gap: "16px",
              marginTop: "38px"
            }}
          >
            <Feature
              icon="$"
              title="USDC as gas"
              text="Arc uses USDC as its native gas currency."
            />

            <Feature
              icon="⚡"
              title="Fast finality"
              text="Transactions are designed to confirm quickly and deterministically."
            />

            <Feature
              icon="E"
              title="EVM compatible"
              text="PayQuick can use familiar Ethereum tooling and wallet infrastructure."
            />

            <Feature
              icon="€"
              title="Stablecoin focused"
              text="The architecture is designed around stablecoin payments."
            />
          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "0 20px 75px"
          }}
        >
          <div
            style={{
              background: "#0f172a",
              color: "#f8fafc",
              borderRadius: "24px",
              padding: "clamp(40px, 7vw, 55px) 24px",
              textAlign: "center"
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(30px, 6vw, 46px)",
                lineHeight: "1.08",
                letterSpacing: "-1.5px"
              }}
            >
              Ready to accept stablecoin payments?
            </h2>

            <p
              style={{
                maxWidth: "600px",
                margin: "18px auto 28px",
                color: "#94a3b8",
                lineHeight: "1.6"
              }}
            >
              Connect your wallet and open the PayQuick merchant dashboard.
            </p>

            <button
              type="button"
              onClick={onGetStarted}
              style={{
                ...primaryButtonStyle,
                background: "#ffffff",
                color: "#0f172a",
                borderColor: "#ffffff",
                padding: "14px 24px"
              }}
            >
              Get started
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid #e2e8f0",
          padding: "26px 20px",
          color: "#64748b"
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap"
          }}
        >
          <strong style={{ color: "#0f172a" }}>
            PayQuick
          </strong>

          <span>
            Stablecoin payments on Arc.
          </span>
        </div>
      </footer>
    </div>
  );
}

function PreviewStat({ value, label }) {
  return (
    <div
      style={{
        background: "#1e293b",
        borderRadius: "12px",
        padding: "14px",
        minWidth: 0
      }}
    >
      <strong
        style={{
          display: "block",
          fontSize: "21px"
        }}
      >
        {value}
      </strong>

      <span
        style={{
          display: "block",
          marginTop: "4px",
          color: "#94a3b8",
          fontSize: "12px"
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "18px",
        padding: "22px"
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "12px",
          background: "#eff6ff",
          color: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "800",
          fontSize: "18px"
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          margin: "18px 0 8px",
          fontSize: "18px"
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          color: "#64748b",
          lineHeight: "1.6",
          fontSize: "14px"
        }}
      >
        {text}
      </p>
    </div>
  );
}

function Step({ number, title, text }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "18px",
        padding: "24px"
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          background: "#0f172a",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "800"
        }}
      >
        {number}
      </div>

      <h3
        style={{
          margin: "18px 0 8px",
          fontSize: "19px"
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          color: "#64748b",
          lineHeight: "1.6",
          fontSize: "14px"
        }}
      >
        {text}
      </p>
    </div>
  );
}

function DarkProblem({ number, title, text }) {
  return (
    <div
      style={{
        border: "1px solid #334155",
        borderRadius: "18px",
        padding: "22px"
      }}
    >
      <span
        style={{
          color: "#64748b",
          fontFamily: "monospace",
          fontSize: "12px"
        }}
      >
        {number}
      </span>

      <h3
        style={{
          margin: "25px 0 8px",
          fontSize: "20px"
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          color: "#94a3b8",
          lineHeight: "1.6",
          fontSize: "14px"
        }}
      >
        {text}
      </p>
    </div>
  );
}

const navButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#475569",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "600",
  padding: "9px 7px",
  whiteSpace: "nowrap"
};

const primaryButtonStyle = {
  border: "1px solid #2563eb",
  background: "#2563eb",
  color: "#ffffff",
  borderRadius: "10px",
  padding: "10px 15px",
  cursor: "pointer",
  fontWeight: "700",
  whiteSpace: "nowrap"
};

const secondaryButtonStyle = {
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  borderRadius: "10px",
  padding: "10px 16px",
  cursor: "pointer",
  fontWeight: "700"
};

const sectionEyebrowStyle = {
  margin: 0,
  color: "#2563eb",
  fontSize: "12px",
  fontWeight: "800",
  letterSpacing: "0.12em"
};

const sectionTitleStyle = {
  maxWidth: "700px",
  margin: "14px 0 0",
  fontSize: "clamp(32px, 5vw, 50px)",
  lineHeight: "1.05",
  letterSpacing: "-1.8px"
};

const darkSectionTitleStyle = {
  maxWidth: "700px",
  margin: "14px 0 0",
  fontSize: "clamp(32px, 5vw, 50px)",
  lineHeight: "1.05",
  letterSpacing: "-1.8px"
};
