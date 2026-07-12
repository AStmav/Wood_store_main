export default function LoadingSpinner({ fullScreen = false }) {
  return (
    <div className={`flex justify-center items-center ${fullScreen ? 'min-h-screen' : 'py-8'}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
} 