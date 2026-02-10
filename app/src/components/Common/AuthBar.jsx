import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthBar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [demoMode] = useState(true); // Demo mode by default

  const handleLogin = () => {
    // Placeholder for login logic
    setIsLoggedIn(true);
    setUser({
      name: 'Alex Chen',
      initial: 'A',
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setShowDropdown(false);
  };

  const handleDashboard = () => {
    navigate('/dashboard');
    setShowDropdown(false);
  };

  return (
    <div className="fixed top-0 right-0 z-40 p-6 flex items-center gap-4">
      {demoMode && (
        <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 rounded-full px-4 py-2 text-sm font-fredoka text-cyan-300">
          Demo Mode
        </div>
      )}

      {isLoggedIn && user ? (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
          >
            {user.initial}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-md border border-cyan-400/30 rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-cyan-400/20">
                <p className="font-fredoka font-semibold text-white">{user.name}</p>
              </div>
              <button
                onClick={handleDashboard}
                className="w-full text-left px-4 py-3 hover:bg-cyan-500/20 text-white font-fredoka transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 hover:bg-red-500/20 text-red-400 font-fredoka transition-colors border-t border-cyan-400/20"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={handleLogin}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-fredoka font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
          >
            Login
          </button>
          <button
            onClick={handleLogin}
            className="px-6 py-2 rounded-lg border border-cyan-400/50 text-cyan-300 font-fredoka font-semibold hover:bg-cyan-400/10 transition-all duration-300"
          >
            Sign Up
          </button>
        </div>
      )}
    </div>
  );
}

export default AuthBar;
