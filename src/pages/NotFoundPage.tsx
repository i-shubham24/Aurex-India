import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-serif text-7xl font-semibold text-copper">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-ink/60">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link to="/" className="btn-copper mt-6">Back to home</Link>
    </div>
  );
}
