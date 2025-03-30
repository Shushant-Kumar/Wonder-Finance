export default function AISuggestion({ suggestion }) {
  return (
    <div className="mt-4 p-4 bg-blue-100 rounded-lg">
      <h3 className="font-medium">AI Money-Saving Tip</h3>
      <p>{suggestion || "Loading..."}</p>
    </div>
  );
}
