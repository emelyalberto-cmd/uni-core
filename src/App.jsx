import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LogOut, Settings, Check, Globe, Clock, Calendar, AlertCircle, BookOpen, Menu, X } from 'lucide-react';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import Horario from './components/Horario';
import Finanzas from './components/Finanzas';
import Tareas from './components/Tareas';
import Pomodoro from './components/Pomodoro';
import Recursos from './components/Recursos';

const APP_VERSION = "0.0.5.2";

// ... (Mantenemos TEMAS y FUENTES igual)
const TEMAS = {
  classic: { bg: '#f8fafc', accent: '#2563eb', card: '#ffffff', text: '#0f172a', nav: 'rgba(255,255,255,0.7)', secondary: '#64748b' },
  anochecer: { bg: '#0f172a', accent: '#818cf8', card: '#1e293b', text: '#f1f5f9', nav: 'rgba(15, 23, 42, 0.8)', secondary: '#94a3b8' },
  primavera_pastel: { bg: '#fff1f2', accent: '#fda4af', card: '#ffffff', text: '#881337', nav: 'rgba(255, 241, 242, 0.8)', secondary: '#fb7185' },
  sunny: { bg: '#fffbeb', accent: '#f59e0b', card: '#ffffff', text: '#78350f', nav: 'rgba(255, 251, 235, 0.8)', secondary: '#b45309' },
  otono: { bg: '#fdf2f2', accent: '#991b1b', card: '#ffffff', text: '#450a0a', nav: 'rgba(253, 242, 242, 0.8)', secondary: '#7f1d1d' },
  tech: { bg: '#000000', accent: '#3b82f6', card: '#111827', text: '#f8fafc', nav: 'rgba(0, 0, 0, 0.8)', secondary: '#64748b' },
  fuego: { bg: '#000000', accent: '#ef4444', card: '#111827', text: '#fef2f2', nav: 'rgba(0, 0, 0, 0.8)', secondary: '#b91c1c' },
  primavera_fuerte: { bg: '#f0fdf4', accent: '#16a34a', card: '#ffffff', text: '#14532d', nav: 'rgba(240, 253, 244, 0.8)', secondary: '#15803d' }
};

const FUENTES = {
  sans: 'sans-serif',
  moderna: '"Inter", system-ui',
  elegante: 'serif',
  tecnica: 'monospace',
  rounded: '"Quicksand", sans-serif'
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

const Home = ({ perfil, tareas, parciales, asignaturas, tema, isMobile, setTareas }) => {
  const [ahora, setAhora] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setAhora(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 1. OBTENEMOS HOY EN FORMATO YYYY-MM-DD SIN INTERPRETACIONES 🇩🇴
  const hoyString = ahora.getFullYear() + '-' + 
                    String(ahora.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(ahora.getDate()).padStart(2, '0');

  // 2. FUNCIÓN DE RENDERIZADO "ANTI-RESTO" 🛡️
  const formatearSeguro = (fechaString) => {
    if (!fechaString) return "Sin fecha";
    
    // Forzamos la creación del objeto fecha pero le sumamos 12 horas 
    // para que cualquier desfase de zona horaria no logre cambiar el día.
    const date = new Date(fechaString + 'T12:00:00');
    
    // Si la fecha sigue siendo inválida por alguna razón, usamos regex
    if (isNaN(date.getTime())) {
        const partes = fechaString.split('T')[0].split('-');
        return `${partes[2]} / ${partes[1]}`;
    }

    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${date.getDate()} ${meses[date.getMonth()]}`;
  };

  const hoyNombre = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][ahora.getDay()];
  
  const clasesHoy = asignaturas
    .filter(a => a.dia === hoyNombre)
    .sort((a, b) => (a.hora_inicio || "").localeCompare(b.hora_inicio || ""));

  const completarTarea = async (id) => {
    const { error } = await supabase.from('tareas').update({ completada: true }).eq('id', id);
    if (!error) setTareas(prev => prev.map(t => t.id === id ? { ...t, completada: true } : t));
  };

  const urgentes = tareas
    .filter(t => !t.completada)
    .sort((a, b) => (a.fecha_entrega || "").localeCompare(b.fecha_entrega || ""))
    .slice(0, 3);

  const proximosParciales = parciales
    .sort((a, b) => (a.fecha_examen || "").localeCompare(b.fecha_examen || ""))
    .slice(0, 2);

  const cardStyle = { 
    background: tema.card, padding: isMobile ? '20px' : '30px', borderRadius: '30px', 
    boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: `1px solid ${tema.accent}40`, 
    textAlign: 'left', color: tema.text 
  };

  return (
    <div style={{ padding: isMobile ? '20px 15px' : '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <style>{`
        @keyframes pulse-red {
          0% { border-color: #ef4444; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { border-color: #ef4444; box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { border-color: #ef4444; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>

      <header style={{ marginBottom: isMobile ? '30px' : '50px' }}>
        <h1 style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: '900', color: tema.text, margin: 0, letterSpacing: '-1.5px' }}>
          Hola, <span style={{ color: tema.accent }}>{perfil?.nombre_preferido || 'Estudiante'}</span>
        </h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: tema.accent }}>
            <AlertCircle size={20}/>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}>Pendientes Críticos</h3>
          </div>
          {urgentes.length > 0 ? urgentes.map((t, i) => {
            const tFecha = (t.fecha_entrega || "").split('T')[0];
            const esHoy = tFecha === hoyString;
            return (
              <div key={i} style={{ 
                padding: '15px', 
                background: esHoy ? '#ef444415' : `${tema.accent}10`, 
                borderRadius: '20px', 
                marginBottom: '10px', 
                border: `1px solid ${esHoy ? '#ef4444' : tema.accent + '20'}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                animation: esHoy ? 'pulse-red 2s infinite' : 'none'
              }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: esHoy ? '#ef4444' : tema.text }}>{t.titulo}</div>
                  <div style={{ fontSize: '10px', opacity: 0.7 }}>{esHoy ? '⚠️ ENTREGA HOY' : `Vence: ${formatearSeguro(t.fecha_entrega)}`}</div>
                </div>
                <button onClick={() => completarTarea(t.id)} style={{ background: esHoy ? '#ef4444' : tema.accent, color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={18} />
                </button>
              </div>
            );
          }) : <p style={{ color: tema.text, opacity: 0.6, fontSize: '13px' }}>¡Todo listo!</p>}
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: tema.accent }}>
            <BookOpen size={20}/>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}>Horario hoy</h3>
          </div>
          {clasesHoy.length > 0 ? clasesHoy.map((c, i) => (
            <div key={i} style={{ padding: '12px', background: tema.accent + '15', borderRadius: '15px', marginBottom: '8px' }}>
              <div style={{ fontWeight: '800', fontSize: '14px', color: tema.text }}>{c.nombre}</div>
              <div style={{ fontSize: '11px', color: tema.text, opacity: 0.7, fontWeight: '600' }}>{c.hora_inicio} — {c.hora_fin}</div>
            </div>
          )) : <p style={{ color: tema.text, opacity: 0.6, fontSize: '13px' }}>Día libre.</p>}
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: tema.accent }}>
            <Calendar size={20}/>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}>Exámenes</h3>
          </div>
          {proximosParciales.map((p, i) => (
            <div key={i} style={{ padding: '12px', background: tema.accent + '10', borderRadius: '15px', marginBottom: '8px', border: `1px solid ${tema.accent}20`, color: tema.text }}>
              <div style={{ fontWeight: '800', fontSize: '14px' }}>{p.asignaturas?.nombre || 'Examen'}</div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>{formatearSeguro(p.fecha_examen)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function App() {
  const isMobile = useIsMobile();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [editNombre, setEditNombre] = useState('');
  const [tareas, setTareas] = useState([]);
  const [parciales, setParciales] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const [perfil, setPerfil] = useState(() => {
    const saved = localStorage.getItem('unicore_prefs');
    return saved ? JSON.parse(saved) : { tema: 'classic', fuente: 'sans', nombre_preferido: '' };
  });

  const temaActual = TEMAS[perfil?.tema] || TEMAS.classic;
  const fuenteActual = FUENTES[perfil?.fuente] || FUENTES.sans;

  const cargarTodo = async (userId) => {
    const { data: pData } = await supabase.from('perfiles').select('*').eq('id', userId).single();
    if (pData) {
      setPerfil(prev => ({ ...pData, tema: prev.tema, fuente: prev.fuente }));
      setEditNombre(pData.nombre_preferido || '');
    }
    const [tRes, pRes, aRes] = await Promise.all([
      supabase.from('tareas').select('*, asignaturas(nombre)').eq('user_id', userId),
      supabase.from('parciales').select('*, asignaturas(nombre)').eq('user_id', userId),
      supabase.from('asignaturas').select('*').eq('user_id', userId)
    ]);
    if (tRes.data) setTareas(tRes.data);
    if (pRes.data) setParciales(pRes.data);
    if (aRes.data) setAsignaturas(aRes.data);
    setLoading(false);
  };

  useEffect(() => {
    document.body.style.backgroundColor = temaActual.bg;
    document.body.style.color = temaActual.text;
  }, [temaActual]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) cargarTodo(s.user.id);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) cargarTodo(s.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const actualizarPreferencia = async (campo, valor) => {
    const nuevoPerfil = { ...perfil, [campo]: valor };
    setPerfil(nuevoPerfil);
    localStorage.setItem('unicore_prefs', JSON.stringify(nuevoPerfil));
    if (session) {
      await supabase.from('perfiles').upsert({ id: session.user.id, ...nuevoPerfil, updated_at: new Date() });
    }
  };

  if (loading) return null;
  if (!session) return <Login />;

  const navLinks = [
    { name: 'Horario', path: '/horario' },
    { name: 'Tareas', path: '/tareas' },
    { name: 'Finanzas', path: '/finanzas' },
    { name: 'Pomodoro', path: '/pomodoro' }
  ];

  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: temaActual.bg, color: temaActual.text, fontFamily: fuenteActual, transition: 'all 0.4s ease' }}>
        
        <nav style={{ 
          position: 'fixed', top: isMobile ? '10px' : '30px', left: '50%', transform: 'translateX(-50%)',
          width: isMobile ? '92%' : '95%', maxWidth: '1200px', backgroundColor: temaActual.nav,
          backdropFilter: 'blur(20px)', borderRadius: isMobile ? '20px' : '35px', padding: isMobile ? '10px 20px' : '15px 45px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 15px 35px rgba(0,0,0,0.15)', zIndex: 1000, border: `1px solid ${temaActual.accent}60`,
          boxSizing: 'border-box'
        }}>
          <Link to="/" style={{ textDecoration: 'none', fontSize: isMobile ? '18px' : '22px', fontWeight: '900', color: temaActual.text }}>
            UNI <span style={{ color: temaActual.accent }}>CORE</span>
          </Link>
          
          {!isMobile ? (
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              {navLinks.map(link => (
                <Link key={link.path} to={link.path} style={{ textDecoration: 'none', color: temaActual.text, fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', opacity: 0.8 }}>{link.name}</Link>
              ))}
              <Link to="/recursos" style={{ textDecoration: 'none', color: temaActual.bg, fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', background: temaActual.accent, padding: '7px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Globe size={14}/> Recursos
              </Link>
              <button onClick={() => setShowConfig(!showConfig)} style={{ border: 'none', background: 'none', color: temaActual.text, opacity: 0.7, cursor: 'pointer' }}><Settings size={20}/></button>
              <button onClick={() => supabase.auth.signOut()} style={{ border: 'none', background: 'none', color: temaActual.text, opacity: 0.7, cursor: 'pointer' }}><LogOut size={20}/></button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <button onClick={() => setMenuOpen(!menuOpen)} style={{ border: 'none', background: 'none', color: temaActual.text }}><Menu size={24}/></button>
            </div>
          )}

          {isMobile && menuOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', background: temaActual.bg, zIndex: 2000, padding: '30px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                   <span style={{ fontWeight: '900', color: temaActual.accent }}>MENÚ</span>
                   <button onClick={() => setMenuOpen(false)} style={{ border: 'none', background: 'none', color: temaActual.text }}><X size={28}/></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                   {navLinks.map(link => (
                     <Link key={link.path} to={link.path} onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: temaActual.text, fontSize: '24px', fontWeight: '900' }}>{link.name}</Link>
                   ))}
                   <Link to="/recursos" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: temaActual.accent, fontSize: '24px', fontWeight: '900' }}>Recursos</Link>
                   <hr style={{ width: '100%', border: `1px solid ${temaActual.accent}20` }}/>
                   <button onClick={() => { setShowConfig(true); setMenuOpen(false); }} style={{ textAlign: 'left', border: 'none', background: 'none', color: temaActual.text, fontSize: '20px', fontWeight: '700' }}>Ajustes</button>
                   <button onClick={() => supabase.auth.signOut()} style={{ textAlign: 'left', border: 'none', background: 'none', color: '#f87171', fontSize: '20px', fontWeight: '700' }}>Cerrar Sesión</button>
                </div>
            </div>
          )}
          
          {showConfig && (
            <div style={{ position: 'absolute', top: isMobile ? '60px' : '80px', right: isMobile ? '4%' : '40px', background: temaActual.card, padding: '25px', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: `1px solid ${temaActual.accent}50`, width: isMobile ? '92%' : '300px', zIndex: 1001, boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h4 style={{ margin: 0, fontSize: '12px', fontWeight: '900', color: temaActual.accent }}>AJUSTES</h4>
                <button onClick={() => setShowConfig(false)} style={{ border: 'none', background: 'none', color: temaActual.text, opacity: 0.5 }}><X size={16}/></button>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '10px', fontWeight: '900', color: temaActual.text, opacity: 0.7, display: 'block', marginBottom: '5px' }}>NOMBRE</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input style={{ flex: 1, padding: '8px', borderRadius: '10px', border: `1px solid ${temaActual.accent}50`, background: temaActual.bg, color: temaActual.text, fontSize: '12px' }} value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
                  <button onClick={() => actualizarPreferencia('nombre_preferido', editNombre)} style={{ background: temaActual.accent, color: temaActual.bg, border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', fontWeight: '800' }}><Check size={14}/></button>
                </div>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '10px', fontWeight: '900', color: temaActual.text, opacity: 0.7, display: 'block', marginBottom: '5px' }}>TEMA</label>
                <select style={{ width: '100%', padding: '8px', borderRadius: '10px', background: temaActual.bg, color: temaActual.text, border: `1px solid ${temaActual.accent}50` }} value={perfil.tema} onChange={(e) => actualizarPreferencia('tema', e.target.value)}>
                  {Object.keys(TEMAS).map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '10px', fontWeight: '900', color: temaActual.text, opacity: 0.7, display: 'block', marginBottom: '5px' }}>FUENTE</label>
                <select style={{ width: '100%', padding: '8px', borderRadius: '10px', background: temaActual.bg, color: temaActual.text, border: `1px solid ${temaActual.accent}50` }} value={perfil.fuente} onChange={(e) => actualizarPreferencia('fuente', e.target.value)}>
                  {Object.keys(FUENTES).map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
                </select>
              </div>
            </div>
          )}
        </nav>

        <main style={{ flex: 1, paddingTop: isMobile ? '100px' : '160px' }}>
          <Routes>
            <Route path="/" element={<Home perfil={perfil} tareas={tareas} parciales={parciales} asignaturas={asignaturas} tema={temaActual} isMobile={isMobile} setTareas={setTareas} />} />
            <Route path="/horario" element={<Horario tema={temaActual} isMobile={isMobile} />} />
            <Route path="/tareas" element={<Tareas tema={temaActual} isMobile={isMobile} />} />
            <Route path="/finanzas" element={<Finanzas tema={temaActual} isMobile={isMobile} />} />
            <Route path="/pomodoro" element={<Pomodoro tema={temaActual} isMobile={isMobile} />} />
            <Route path="/recursos" element={<Recursos session={session} tema={temaActual} isMobile={isMobile} />} />
          </Routes>
        </main>

        <footer style={{ padding: '30px 20px', textAlign: 'center', color: temaActual.text, opacity: 0.6, fontSize: '10px', fontWeight: '800' }}>
          UNI CORE — v{APP_VERSION}
        </footer>
      </div>
    </Router>
  );
}

export default App;