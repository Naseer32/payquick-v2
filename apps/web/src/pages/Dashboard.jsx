export default function Dashboard({ merchant }) {
  return (
    <section>
      <h2>Dashboard</h2>

      {merchant ? (
        <p>
          Merchant wallet: {merchant.wallet_address}
        </p>
      ) : (
        <p>Connect your wallet to access your merchant dashboard.</p>
      )}
    </section>
  );
}
