import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://ajanlat-app.onrender.com/register", {
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
        alert("Sikeres regisztráció!");
        navigate("/login");
      }
    } catch {
      alert("Hiba történt");
    }
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Regisztráció</h1>

      <form onSubmit={handleRegister}>
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

        <button type="submit">Regisztráció</button>
      </form>

      <p onClick={() => navigate("/login")} style={{ cursor: "pointer", marginTop: "20px" }}>
        Van már fiókod? Belépés
      </p>
    </div>
  );
}

export default Register;