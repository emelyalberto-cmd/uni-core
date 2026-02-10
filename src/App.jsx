import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LogOut, Sparkles, Settings, Check, Trash2, Globe, Clock, Calendar, AlertCircle, BookOpen, Palette, Type } from 'lucide-react';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import Horario from './components/Horario';
import Finanzas from './components/Finanzas';
import Tareas from './components/Tareas';
import Pomodoro from './components/Pomodoro';
import Recursos from './components/Recursos';

const APP_VERSION = "0.0.1";

// 1. DEFINICIÓN DE TEMAS
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

const Home = ({ perfil, tareas, parciales, asignaturas, tema }) => {
  const [ahora, setAhora] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setAhora(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const hoyNombre = diasSemana[ahora.getDay()];
  const clasesHoy = asignaturas.filter(a => a.dia === hoyNombre).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

  const obtenerProgresoClase = (inicio, fin) => {
    const [hI, mI] = inicio.split(':').map(Number);
    const [hF, mF] = fin.split(':').map(Number);
    const dInicio = new Date(ahora); dInicio.setHours(hI, mI, 0);
    const dFin = new Date(ahora); dFin.setHours(hF, mF, 0);
    if (ahora < dInicio) return 0;
    if (ahora > dFin) return 100;
    return Math.round(((ahora - dInicio) / (dFin - dInicio)) * 100);
  };

  const claseActual = clasesHoy.find(c => {
    const p = obtenerProgresoClase(c.hora_inicio, c.hora_fin);
    return p > 0 && p < 100;
  });

  const siguienteClase = clasesHoy.find(c => {
    const [hI, mI] = c.hora_inicio.split(':').map(Number);
    const dInicio = new Date(ahora); dInicio.setHours(hI, mI, 0);
    return ahora < dInicio;
  });

  const urgentes = tareas.filter(t => !t.completada).sort((a, b) => new Date(a.fecha_entrega) - new Date(b.fecha_entrega)).slice(0, 2);
  const proximosParciales = parciales.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).slice(0, 2);

  const cardStyle = { 
    background: tema.card, padding: '30px', borderRadius: '35px', 
    boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: `1px solid ${tema.accent}20`, 
    textAlign: 'left', color: tema.text 
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px' }}>
        {claseActual ? (
          <div style={{ background: tema.accent + '20', padding: '30px', borderRadius: '40px', border: `1px solid ${tema.accent}40`, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '15px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '900', color: tema.accent, background: tema.accent + '30', padding: '5px 12px', borderRadius: '10px', textTransform: 'uppercase' }}>En curso ahora</span>
                <h2 style={{ fontSize: '28px', fontWeight: '900', color: tema.text, margin: '10px 0 5px 0' }}>{claseActual.nombre}</h2>
                <p style={{ margin: 0, fontSize: '14px', color: tema.secondary, fontWeight: '600' }}>Aula: {claseActual.aula} — Termina a las {claseActual.hora_fin}</p>
              </div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: tema.accent }}>{obtenerProgresoClase(claseActual.hora_inicio, claseActual.hora_fin)}%</div>
            </div>
            <div style={{ width: '100%', background: tema.accent + '15', height: '14px', borderRadius: '20px', overflow: 'hidden' }}>
              <div style={{ width: `${obtenerProgresoClase(claseActual.hora_inicio, claseActual.hora_fin)}%`, background: tema.accent, height: '100%', borderRadius: '20px', transition: 'width 1s ease' }}></div>
            </div>
          </div>
        ) : siguienteClase ? (
          <div style={{ background: tema.card, padding: '20px 30px', borderRadius: '30px', border: `1px solid ${tema.accent}20`, display: 'flex', alignItems: 'center', gap: '15px', textAlign: 'left' }}>
            <div style={{ background: tema.accent + '15', padding: '10px', borderRadius: '15px', color: tema.accent }}><Clock size={20}/></div>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: tema.secondary }}>
              Tu siguiente clase es <span style={{ color: tema.accent }}>{siguienteClase.nombre}</span> a las {siguienteClase.hora_inicio}
            </p>
          </div>
        ) : (
          <div style={{ background: tema.accent + '10', padding: '20px 30px', borderRadius: '30px', border: `1px solid ${tema.accent}30`, color: tema.accent, fontWeight: '800', textAlign: 'left', fontSize: '15px' }}>
            ✨ No tienes más clases hoy.
          </div>
        )}
      </div>

      <header style={{ marginBottom: '50px', textAlign: 'left' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '900', color: tema.text, margin: 0, letterSpacing: '-2px' }}>
          Hola, <span style={{ color: tema.accent }}>{perfil?.nombre_preferido || 'Estudiante'}</span>
        </h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: tema.accent }}>
            <BookOpen size={20}/>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', textTransform: 'uppercase' }}>Tu Horario</h3>
          </div>
          {clasesHoy.length > 0 ? (
            clasesHoy.map((c, i) => (
              <div key={i} style={{ padding: '15px', background: tema.accent + '05', borderRadius: '20px', marginBottom: '10px' }}>
                <div style={{ fontWeight: '800' }}>{c.nombre}</div>
                <div style={{ fontSize: '12px', color: tema.secondary }}>{c.hora_inicio} — {c.hora_fin}</div>
              </div>
            ))
          ) : <p style={{ color: tema.secondary }}>Día libre.</p>}
        </div>

        <div style={{ ...cardStyle, background: tema.bg === '#000000' ? tema.accent + '20' : '#0f172a', color: 'white', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#f87171' }}>
            <AlertCircle size={20}/>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', textTransform: 'uppercase' }}>Tareas</h3>
          </div>
          {urgentes.map((t, i) => (
            <div key={i} style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontWeight: '700' }}>{t.titulo}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(t.fecha_entrega).toLocaleDateString()}</div>
            </div>
          ))}
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#f59e0b' }}>
            <Calendar size={20}/>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', textTransform: 'uppercase' }}>Exámenes</h3>
          </div>
          {proximosParciales.map((p, i) => (
            <div key={i} style={{ padding: '15px', background: '#fffbeb', borderRadius: '20px', marginBottom: '10px', border: '1px solid #fef3c7', color: '#92400e' }}>
              <div style={{ fontWeight: '800' }}>{p.materia}</div>
              <div style={{ fontSize: '12px' }}>{new Date(p.fecha).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [session, setSession] = useState(null);
  const [perfil, setPerfil] = useState({ tema: 'classic', fuente: 'sans' });
  const [loading, setLoading] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [editNombre, setEditNombre] = useState('');
  const [tareas, setTareas] = useState([]);
  const [parciales, setParciales] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);

  // DETERMINAR TEMA Y FUENTE (Aquí es donde ocurre la magia)
  const temaActual = TEMAS[perfil?.tema] || TEMAS.classic;
  const fuenteActual = FUENTES[perfil?.fuente] || FUENTES.sans;

  // EFECTO PARA CAMBIAR EL COLOR DEL BODY (Para que el fondo total cambie)
  useEffect(() => {
    document.body.style.backgroundColor = temaActual.bg;
    document.body.style.transition = "background-color 0.4s ease";
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

  const cargarTodo = async (userId) => {
    setLoading(true);
    const [pRef, tRes, pRes, aRes] = await Promise.all([
      supabase.from('perfiles').select('*').eq('id', userId).single(),
      supabase.from('tareas').select('*').eq('user_id', userId),
      supabase.from('parciales').select('*').eq('user_id', userId),
      supabase.from('asignaturas').select('*').eq('user_id', userId)
    ]);
    if (pRef.data) {
        setPerfil(pRef.data);
        setEditNombre(pRef.data.nombre_preferido || '');
    }
    if (tRes.data) setTareas(tRes.data);
    if (pRes.data) setParciales(pRes.data);
    if (aRes.data) setAsignaturas(aRes.data);
    setLoading(false);
  };

  const actualizarPreferencia = async (campo, valor) => {
    // ACTUALIZACIÓN OPTIMISTA: Cambiamos el estado local de inmediato
    const nuevoPerfil = { ...perfil, [campo]: valor };
    setPerfil(nuevoPerfil);
    
    const { error } = await supabase.from('perfiles').upsert({ id: session.user.id, ...nuevoPerfil });
    if (error) console.error("Error al guardar:", error);
  };

  const handleLimpiarSemestre = async () => {
    const confirmar = window.confirm("¿Seguro que quieres reiniciar todo el semestre?");
    if (confirmar) {
      await Promise.all([
        supabase.from('asignaturas').delete().eq('user_id', session.user.id),
        supabase.from('tareas').delete().eq('user_id', session.user.id),
        supabase.from('parciales').delete().eq('user_id', session.user.id)
      ]);
      window.location.reload();
    }
  };

  if (loading) return null;
  if (!session) return <Login />;

  return (
    <Router>
      <div style={{ 
        minHeight: '100vh', backgroundColor: temaActual.bg, color: temaActual.text, 
        fontFamily: fuenteActual, display: 'flex', flexDirection: 'column', transition: 'all 0.4s ease' 
      }}>
        <nav style={{ 
          position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)',
          width: '95%', maxWidth: '1200px', backgroundColor: temaActual.nav,
          backdropFilter: 'blur(20px)', borderRadius: '35px', padding: '15px 45px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 15px 35px rgba(0,0,0,0.04)', zIndex: 1000, border: `1px solid ${temaActual.accent}20`,
          boxSizing: 'border-box'
        }}>
          <Link to="/" style={{ textDecoration: 'none', fontSize: '22px', fontWeight: '900', color: temaActual.text }}>
            UNI <span style={{ color: temaActual.accent }}>CORE</span>
          </Link>
          
          <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
            {['horario', 'tareas', 'finanzas', 'pomodoro'].map(path => (
              <Link key={path} to={`/${path}`} style={{ textDecoration: 'none', color: temaActual.secondary, fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>{path}</Link>
            ))}
            <Link to="/recursos" style={{ textDecoration: 'none', color: temaActual.accent, fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', background: temaActual.accent + '15', padding: '5px 15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Globe size={14}/> Recursos
            </Link>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button onClick={() => setShowConfig(!showConfig)} style={{ border: 'none', background: 'none', color: temaActual.secondary, cursor: 'pointer' }}><Settings size={22}/></button>
            <button onClick={() => supabase.auth.signOut()} style={{ border: 'none', background: 'none', color: temaActual.secondary, cursor: 'pointer' }}><LogOut size={22}/></button>
          </div>

          {showConfig && (
            <div style={{ position: 'absolute', top: '80px', right: '40px', background: temaActual.card, padding: '30px', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', border: `1px solid ${temaActual.accent}20`, width: '300px', zIndex: 1001 }}>
              <h4 style={{ margin: '0 0 20px 0', fontSize: '12px', fontWeight: '900', color: temaActual.accent }}>PERSONALIZACIÓN</h4>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '10px', fontWeight: '900', color: temaActual.secondary, display: 'block', marginBottom: '8px' }}>NOMBRE</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input style={{ flex: 1, padding: '10px', borderRadius: '12px', border: `1px solid ${temaActual.accent}20`, background: temaActual.bg, color: temaActual.text }} value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
                  <button onClick={() => actualizarPreferencia('nombre_preferido', editNombre)} style={{ background: temaActual.accent, color: 'white', border: 'none', borderRadius: '10px', padding: '10px' }}><Check size={16}/></button>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '10px', fontWeight: '900', color: temaActual.secondary, display: 'block', marginBottom: '8px' }}><Palette size={12}/> TEMA</label>
                <select style={{ width: '100%', padding: '10px', borderRadius: '12px', background: temaActual.bg, color: temaActual.text }} value={perfil.tema} onChange={(e) => actualizarPreferencia('tema', e.target.value)}>
                  {Object.keys(TEMAS).map(t => <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ fontSize: '10px', fontWeight: '900', color: temaActual.secondary, display: 'block', marginBottom: '8px' }}><Type size={12}/> FUENTE</label>
                <select style={{ width: '100%', padding: '10px', borderRadius: '12px', background: temaActual.bg, color: temaActual.text }} value={perfil.fuente} onChange={(e) => actualizarPreferencia('fuente', e.target.value)}>
                  {Object.keys(FUENTES).map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
                </select>
              </div>
            </div>
          )}
        </nav>

        <main style={{ flex: 1, paddingTop: '160px' }}>
          <Routes>
            <Route path="/" element={<Home perfil={perfil} tareas={tareas} parciales={parciales} asignaturas={asignaturas} tema={temaActual} />} />
            <Route path="/horario" element={<Horario />} />
            <Route path="/tareas" element={<Tareas />} />
            <Route path="/finanzas" element={<Finanzas />} />
            <Route path="/pomodoro" element={<Pomodoro />} />
            <Route path="/recursos" element={<Recursos session={session} />} />
          </Routes>
        </main>

        <footer style={{ padding: '40px 20px', textAlign: 'center', color: temaActual.secondary, fontSize: '11px', fontWeight: '800' }}>
          UNI CORE — <span style={{ color: temaActual.accent }}>v{APP_VERSION}</span>
        </footer>
      </div>
    </Router>
  );
}

export default App;