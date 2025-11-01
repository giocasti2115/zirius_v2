import React, { useState } from "react";
import { router } from '@inertiajs/react';
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    router.post(route('login'), { email, password }, {
      onError: (errors) => {
        setError(errors.email || errors.password || "Credenciales incorrectas");
        setLoading(false);
      },
      onFinish: () => setLoading(false)
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-white rounded shadow p-8 space-y-6">
          <h1 className="text-2xl font-bold mb-2 text-center">Iniciar Sesión</h1>
          <div>
            <label className="block mb-1 font-medium">Usuario</label>
            <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Contraseña</label>
            <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} />
          </div>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
