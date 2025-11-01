import { useNavigate } from 'react-router-dom';

export default function ComingSoonPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-lg space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600">
          <i className="ri-rocket-line text-3xl" aria-hidden />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">This feature is in progress</h1>
        <p className="text-gray-600 leading-relaxed">
          We are polishing this experience. Please check back soon for a fully supported release.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-3 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition whitespace-nowrap"
          >
            Go back
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition whitespace-nowrap"
          >
            Go to home
          </button>
        </div>
      </div>
    </div>
  );
}
