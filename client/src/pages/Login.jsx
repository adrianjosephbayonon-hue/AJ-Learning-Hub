function Login() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Login</h1>

        <form>
          <input
            type="email"
            placeholder="Email Address"
          />

          <input
            type="password"
            placeholder="Password"
          />

          <button type="submit">
            Login
          </button>
        </form>

        <p>
          Don't have an account? Register
        </p>
      </div>
    </div>
  );
}

export default Login;