import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { user, logout, loading } = useAuth(); // ✅ Get `loading` state

  return (
    <div className="w-full h-screen flex justify-center items-center bg-neutral-900 text-white">
      {loading ? (
        // ✅ Show loading text while checking authentication
        <h2 className="text-xl font-semibold">Checking authentication...</h2>
      ) : user ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold">Welcome, {user.displayName}</h2>
          <button onClick={logout} className="mt-4 px-6 py-2 bg-red-500 rounded-lg hover:bg-red-600">
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 max-xs:gap-1">
          <p className="text-3xl max-xs:text-xs font-semibold">Welcome to</p>
          <img src="assets/logo/musicly-text-white-logo.svg" className="w-48 max-xs:w-20" alt="" />
          <p className="text-3xl max-xs:text-xs font-semibold">your <span className="w-full bg-green-400 py-1.5 px-2">personalized app.</span></p>
        </div>
      )}
    </div>
  );
};

export default Login;
