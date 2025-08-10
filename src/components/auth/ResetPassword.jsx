import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await resetPassword(email);
      setMessage('Vérifiez vos courriels pour continuer.');
    } catch {
      setError("Impossible de réinitialiser le mot de passe");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold text-center">Réinitialiser le mot de passe</h2>
        {error && <div className="p-2 text-red-600 bg-red-100 rounded">{error}</div>}
        {message && <div className="p-2 text-green-600 bg-green-100 rounded">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Réinitialiser
          </button>
        </form>
        <div className="text-sm text-center">
          <Link to="/login" className="text-blue-600 hover:underline">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
