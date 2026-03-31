import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { motion } from "motion/react";
import { login } from "../services/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="backdrop-blur-lg bg-white/40 rounded-3xl p-8 border border-white/50 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-2 text-gray-600">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/60 bg-white/60 px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm backdrop-blur-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/60 bg-white/60 px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm backdrop-blur-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-red-50/80 border border-red-200 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3.5 font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
