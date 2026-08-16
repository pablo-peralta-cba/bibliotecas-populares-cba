import { useFlash } from '../../context/FlashContext';

export default function FlashMessages() {
  const { success, error, clearFlash } = useFlash();

  if (success.length === 0 && error.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      {success.map((message, index) => (
        <div
          key={`success-${index}`}
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-2 flex justify-between items-center"
        >
          <span>{message}</span>
          <button
            onClick={clearFlash}
            className="text-green-700 hover:text-green-900"
          >
            &times;
          </button>
        </div>
      ))}
      {error.map((message, index) => (
        <div
          key={`error-${index}`}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-2 flex justify-between items-center"
        >
          <span>{message}</span>
          <button
            onClick={clearFlash}
            className="text-red-700 hover:text-red-900"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
