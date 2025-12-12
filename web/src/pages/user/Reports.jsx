export default function Reports() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold text-purple-900 mb-3">
          Reports
        </h1>
        <p className="text-gray-600 mb-6">
          View and track your submitted reports.
        </p>

        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <p>No reports yet.</p>
        </div>
      </div>
    </div>
  );
}
