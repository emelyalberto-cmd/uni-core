import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { LogIn, Mail, Lock, Sparkles, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (type) => {
    setLoading(true);
    const { error } = type === 'login' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) alert(error.message);
    else alert(type === 'login' ? "¡Bienvenida, Emely!" : "¡Revisa tu correo para confirmar!");
    setLoading(false);
  };

  // Estilos Glassmorphism corregidos
  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    borderRadius: '40px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
    padding: '50px 40px',
    width: '100%',
    maxWidth: '450px',
    textAlign: 'center',
    boxSizing: 'border-box' // Asegura que el padding no estire el contenedor
  };

  const inputGroupStyle = {
    position: 'relative',
    marginBottom: '15px',
    width: '100%',
    boxSizing: 'border-box'
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 15px 14px 45px',
    borderRadius: '15px',
    border: '1px solid #e2e8f0',
    outline: 'none',
    fontSize: '14px',
    background: 'rgba(255, 255, 255, 0.8)',
    transition: '0.3s',
    boxSizing: 'border-box' // ESTA ES LA CLAVE: El padding ahora va hacia adentro
  };

  const iconStyle = {
    position: 'absolute',
    left: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8'
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '20px',
      fontFamily: 'sans-serif',
      boxSizing: 'border-box'
    }}>
      <div style={glassStyle}>
        {/* LOGO Y TÍTULO */}
        <header style={{ marginBottom: '40px' }}>
          <div style={{ 
            display: 'inline-flex', padding: '15px', background: '#2563eb', 
            borderRadius: '20px', color: 'white', marginBottom: '20px',
            boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-2px' }}>
            UNI <span style={{ color: '#2563eb' }}>CORE</span>
          </h1>
          <p style={{ color: '#64748b', fontWeight: '600', marginTop: '10px', fontSize: '14px' }}>
            SISTEMA DE GESTIÓN ACADÉMICA
          </p>
        </header>

        {/* FORMULARIO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={inputGroupStyle}>
            <Mail size={18} style={iconStyle} />
            <input 
              style={inputStyle}
              type="email" 
              placeholder="Correo electrónico" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div style={inputGroupStyle}>
            <Lock size={18} style={iconStyle} />
            <input 
              style={inputStyle}
              type="password" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button 
              onClick={() => handleAuth('login')} 
              disabled={loading}
              style={{ 
                flex: 2, padding: '16px', background: '#0f172a', color: 'white', 
                borderRadius: '18px', fontWeight: '800', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                fontSize: '13px', transition: '0.3s'
              }}
            >
              <LogIn size={18} /> {loading ? 'Cargando...' : 'ENTRAR'}
            </button>

            <button 
              onClick={() => handleAuth('signup')} 
              disabled={loading}
              style={{ 
                flex: 1, padding: '16px', background: 'white', color: '#0f172a', 
                borderRadius: '18px', fontWeight: '800', border: '1px solid #e2e8f0', 
                cursor: 'pointer', fontSize: '13px', transition: '0.3s'
              }}
            >
              UNIRSE
            </button>
          </div>
        </div>

        <footer style={{ marginTop: '40px' }}>
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            gap: '8px', color: '#94a3b8', fontSize: '11px', fontWeight: '700',
            textTransform: 'uppercase', letterSpacing: '1px'
          }}>
            <Sparkles size={14} color="#2563eb" /> 
            Desarrollado por Emely Alberto
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Login;