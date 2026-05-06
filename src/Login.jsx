import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://ajanlat-app.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
      } else {
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("token", data.access_token);
        navigate("/app");
      }
    } catch {
      alert("Hiba történt");
    }
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Bejelentkezés</h1>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br /><br />

        <input
          type="password"
          placeholder="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br /><br />

        <button type="submit">Belépés</button>
      </form>

      <p onClick={() => navigate("/register")} style={{ cursor: "pointer", marginTop: "20px" }}>
        Nincs fiókod? Regisztrálj
      </p>
    </div>
  );
}

export default Login;