import Dashboard from "./pages/Dashboard.jsx";
import Invoices from "./pages/Invoices.jsx";
import Checkout from "./pages/Checkout.jsx";
import Customers from "./pages/Customers.jsx";
import WalletButton from "./components/WalletButton.jsx";

export default function App() {
  return (
    <main>
      <header>
        <h1>PayQuick V2</h1>
        <WalletButton />
      </header>

      <Dashboard />
      <Invoices />
      <Checkout />
      <Customers />
    </main>
  );
}
