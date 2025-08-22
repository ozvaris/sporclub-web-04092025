export default function NotFound() {
  return (
    <div className="h-screen flex items-center justify-center text-center">
      <div>
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <p className="text-lg mb-6">Page not found</p>
        <a href="/" className="text-primary underline">Return home</a>
      </div>
    </div>
  );
}