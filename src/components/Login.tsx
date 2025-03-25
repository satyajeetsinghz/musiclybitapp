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
        <div>Company Advertisment Page</div>
      )}
    </div>
  );
};

export default Login;
