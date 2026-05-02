import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegistering) {
        const response = await fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, first_name: firstName, last_name: lastName, password })
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Registration failed');
        }
        setIsRegistering(false);
        setError('Registration successful! Please login.');
      } else {
        const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Login failed');
        }
        onLogin();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const styles = {
    container: { maxWidth: 400, margin: '50px auto', padding: 20, background: '#fff9f2', borderRadius: 24, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' },
    title: { color: '#8b5a2b', textAlign: 'center', marginBottom: 20 },
    input: { width: '100%', padding: 12, marginBottom: 15, borderRadius: 12, border: '1px solid #d9b382', boxSizing: 'border-box', fontSize: 16 },
    button: { width: '100%', padding: 12, background: '#8b5a2b', color: 'white', border: 'none', borderRadius: 40, cursor: 'pointer', fontSize: 16 },
    switchBtn: { marginTop: 15, background: 'none', border: 'none', color: '#8b5a2b', cursor: 'pointer', width: '100%', textDecoration: 'underline' },
    error: { color: '#c0392b', textAlign: 'center', marginBottom: 15 },
    success: { color: '#27ae60', textAlign: 'center', marginBottom: 15 }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{isRegistering ? 'Register' : 'Login'}</h2>
      {error && <p style={error.includes('successful') ? styles.success : styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        {isRegistering && (
          <>
            <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={styles.input} required />
            <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} style={styles.input} required />
          </>
        )}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />
        <button type="submit" style={styles.button}>{isRegistering ? 'Register' : 'Login'}</button>
      </form>
      <button onClick={() => { setIsRegistering(!isRegistering); setError(''); }} style={styles.switchBtn}>
        {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
      </button>
    </div>
  );
}