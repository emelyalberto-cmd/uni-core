import React, { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Trash2, Book, Wrench, Bookmark } from 'lucide-react';
import { supabase } from '../supabaseClient';

// ✅ 1. Definimos el sub-componente fuera, pero aseguramos que reciba el TEMA
const RenderColumna = ({ titulo, icon: IconComponent, color, catKey, enlaces, enlacesEstandar, tema, isMobile, eliminarEnlace }) => {
  const filtradosPersonal = enlaces.filter(e => e.categoria === catKey);
  const filtradosEstandar = enlacesEstandar.filter(e => e.categoria === catKey);
  const todos = [...filtradosEstandar, ...filtradosPersonal];

  return (
    <div style={{ flex: 1, minWidth: isMobile ? '100%' : '300px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', padding: '0 10px' }}>
        <div style={{ background: color + '20', padding: '8px', borderRadius: '12px' }}>
          <IconComponent size={18} color={color} />
        </div>
        <h3 style={{ fontSize: '14px', fontWeight: '900', color: tema.text, textTransform: 'uppercase', letterSpacing: '1px', margin: 0, opacity: 0.8 }}>
          {titulo}
        </h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {todos.map((enlace, i) => (
          <div key={i} style={{ 
            background: tema.card, // ✅ Usa el color de carta del tema actual
            padding: '15px 20px', 
            borderRadius: '20px', 
            border: `1px solid ${tema.accent}20`, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            color: tema.text // ✅ Asegura el color de texto
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: '700', color: tema.text, fontSize: '14px' }}>{enlace.nombre}</span>
              <a href={enlace.url} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: tema.text, opacity: 0.5, textDecoration: 'none' }}>
                Visitar enlace
              </a>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {enlace.id && (
                <button onClick={() => eliminarEnlace(enlace.id)} style={{ border: 'none', background: 'none', color: '#fca5a5', cursor: 'pointer' }}>
                  <Trash2 size={16}/>
                </button>
              )}
              <a href={enlace.url} target="_blank" rel="noreferrer" style={{ color: color }}>
                <ExternalLink size={18}/>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Recursos = ({ session, tema, isMobile }) => {
  const [enlaces, setEnlaces] = useState([]);
  const [nuevo, setNuevo] = useState({ nombre: '', url: '', categoria: 'Individuales' });

  const enlacesEstandar = [
    { nombre: 'Moodle UCNE', url: 'https://ucnevirtual.ucne.edu.do/login/index.php', categoria: 'Académico' },
    { nombre: 'ChatGPT', url: 'https://chatgpt.com/', categoria: 'Herramientas de Apoyo' },
    { nombre: 'Gemini', url: 'https://gemini.google.com/', categoria: 'Herramientas de Apoyo' }
  ];

  const fetchEnlaces = useCallback(async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase.from('recursos').select('*').eq('user_id', session.user.id);
    if (data) setEnlaces(data);
  }, [session]);

  useEffect(() => {
    fetchEnlaces();
  }, [fetchEnlaces]);

  const agregarEnlace = async (e) => {
    e.preventDefault();
    if (!nuevo.nombre || !nuevo.url) return;
    const { error } = await supabase.from('recursos').insert([{ ...nuevo, user_id: session.user.id }]);
    if (!error) {
      setNuevo({ nombre: '', url: '', categoria: 'Individuales' });
      fetchEnlaces();
    }
  };

  const eliminarEnlace = async (id) => {
    const { error } = await supabase.from('recursos').delete().eq('id', id);
    if (!error) fetchEnlaces();
  };

  const inputStyle = { 
    padding: '12px', borderRadius: '12px', border: `1px solid ${tema.accent}20`, 
    outline: 'none', flex: 1, background: tema.bg, color: tema.text, fontSize: '14px'
  };

  return (
    <div style={{ padding: isMobile ? '20px 15px' : '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '900', color: tema.text, letterSpacing: '-2px' }}>
          Centro de <span style={{ color: tema.accent }}>Recursos</span>
        </h2>
        
        <form onSubmit={agregarEnlace} style={{ 
          background: tema.card, padding: '20px', borderRadius: '25px', display: 'flex', gap: '10px', 
          flexWrap: 'wrap', justifyContent: 'center', marginTop: '30px', border: `1px solid ${tema.accent}30` 
        }}>
          <input placeholder="Nombre del sitio" style={inputStyle} value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} required />
          <input placeholder="URL (https://...)" style={inputStyle} value={nuevo.url} onChange={e => setNuevo({...nuevo, url: e.target.value})} required />
          <select style={{ ...inputStyle, fontWeight: '600' }} value={nuevo.categoria} onChange={e => setNuevo({...nuevo, categoria: e.target.value})}>
            <option value="Académico">Académico</option>
            <option value="Herramientas de Apoyo">Herramientas de Apoyo</option>
            <option value="Individuales">Individuales</option>
          </select>
          <button type="submit" style={{ background: tema.accent, color: tema.bg, border: 'none', borderRadius: '12px', padding: '0 25px', fontWeight: '700', cursor: 'pointer', minHeight: '45px' }}>
            Añadir
          </button>
        </form>
      </header>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* ✅ Pasamos 'tema' y 'isMobile' explícitamente a cada columna */}
        <RenderColumna titulo="Académico" icon={Book} color={tema.accent} catKey="Académico" enlaces={enlaces} enlacesEstandar={enlacesEstandar} tema={tema} isMobile={isMobile} eliminarEnlace={eliminarEnlace} />
        <RenderColumna titulo="Herramientas IA" icon={Wrench} color="#7c3aed" catKey="Herramientas de Apoyo" enlaces={enlaces} enlacesEstandar={enlacesEstandar} tema={tema} isMobile={isMobile} eliminarEnlace={eliminarEnlace} />
        <RenderColumna titulo="Marcadores" icon={Bookmark} color="#64748b" catKey="Individuales" enlaces={enlaces} enlacesEstandar={enlacesEstandar} tema={tema} isMobile={isMobile} eliminarEnlace={eliminarEnlace} />
      </div>
    </div>
  );
};

export default Recursos;