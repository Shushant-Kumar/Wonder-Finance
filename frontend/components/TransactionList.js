export default function TransactionList({ transactions }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2">Recent Transactions</h2>
      {transactions.length === 0 ? (
        <p>No transactions available.</p>
      ) : (
        <ul>
          {transactions.map((t, i) => (
            <li key={i} className="border-b p-2">
              {t.category}: ₹{t.amount}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
