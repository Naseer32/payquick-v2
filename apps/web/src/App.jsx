import { useState } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import Invoices from "./pages/Invoices.jsx";
import Checkout from "./pages/Checkout.jsx";
import Customers from "./pages/Customers.jsx";
import WalletButton from "./components/WalletButton.jsx";

export default function App() {
  const [merchant, setMerchant] = useState(null);

  return (
    <main>
      <header>
        <h1>PayQuick V2</h1>

        <WalletButton onAuthenticated={setMerchant} />
      </header>

      <Dashboard merchant={merchant} />
      <Invoices merchant={merchant} />
      <Checkout merchant={merchant} />
      <Customers merchant={merchant} />
    </main>
  );
}
