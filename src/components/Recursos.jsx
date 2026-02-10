import React, { useState, useEffect } from 'react';
import { ExternalLink, Plus, Trash2, Globe, Book, Wrench, Bookmark } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Recursos = ({ session }) => {
  const [enlaces, setEnlaces] = useState([]);
  const [nuevo, setNuevo] = useState({ nombre: '', url: '', categoria: 'Individuales' });

  // ENLACES ESTÁNDAR (Estos no se borran)
  const enlacesEstandar = [
    { nombre: 'Moodle UCNE', url: 'https://ucnevirtual.ucne.edu.do/login/index.php', categoria: 'Académico' },
    { nombre: 'ChatGPT', url: 'https://chatgpt.com/', categoria: 'Herramientas de Apoyo' },
    { nombre: 'Gemini', url: 'https://gemini.google.com/', categoria: 'Herramientas de Apoyo' }
  ];

  useEffect(() => { fetchEnlaces(); }, []);

  const fetchEnlaces = async () => {
    const { data } = await supabase.from('recursos').select('*').eq('user_id', session.user.id);
    if (data) setEnlaces(data);
  };

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
    await supabase.from('recursos').delete().eq('id', id);
    fetchEnlaces();
  };

  // Función para renderizar una columna específica
  const RenderColumna = ({ titulo, icon: Icon, color, catKey }) => {
    const filtradosPersonal = enlaces.filter(e => e.categoria === catKey);
    const filtradosEstandar = enlacesEstandar.filter(e => e.categoria === catKey);
    const todos = [...filtradosEstandar, ...filtradosPersonal];

    return (
      <div style={{ flex: 1, minWidth: '300px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', padding: '0 10px' }}>
          <div style={{ background: color + '20', padding: '8px', borderRadius: '12px' }}><Icon size={18} color={color} /></div>
          <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{titulo}</h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {todos.map((enlace, i) => (
            <div key={i} style={{ background: 'white', padding: '15px 20px', borderRadius: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{enlace.nombre}</span>
                <a href={enlace.url} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'none' }}>Visitar enlace</a>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {enlace.id && (
                  <button onClick={() => eliminarEnlace(enlace.id)} style={{ border: 'none', background: 'none', color: '#fca5a5', cursor: 'pointer' }}><Trash2 size={14}/></button>
                )}
                <a href={enlace.url} target="_blank" rel="noreferrer" style={{ color: color }}><ExternalLink size={16}/></a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h2 style={{ fontSize: '42px', fontWeight: '900', color: '#0f172a', letterSpacing: '-2px' }}>Centro de <span style={{ color: '#2563eb' }}>Recursos</span></h2>
        
        {/* FORMULARIO DE AGREGAR */}
        <form onSubmit={agregarEnlace} style={{ background: 'white', padding: '20px', borderRadius: '25px', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '30px', border: '1px solid #e2e8f0' }}>
          <input placeholder="Nombre del sitio" style={{ padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9', outline: 'none', flex: 1 }} value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} required />
          <input placeholder="URL (https://...)" style={{ padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9', outline: 'none', flex: 1 }} value={nuevo.url} onChange={e => setNuevo({...nuevo, url: e.target.value})} required />
          <select style={{ padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9', outline: 'none', background: 'white', fontWeight: '600' }} value={nuevo.categoria} onChange={e => setNuevo({...nuevo, categoria: e.target.value})}>
            <option value="Académico">Académico</option>
            <option value="Herramientas de Apoyo">Herramientas de Apoyo</option>
            <option value="Individuales">Individuales</option>
          </select>
          <button type="submit" style={{ background: '#0f172a', color: 'white', border: 'none', borderRadius: '12px', padding: '0 25px', fontWeight: '700', cursor: 'pointer' }}>Añadir</button>
        </form>
      </header>

      {/* COLUMNAS */}
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <RenderColumna titulo="Académico" icon={Book} color="#2563eb" catKey="Académico" />
        <RenderColumna titulo="Herramientas IA" icon={Wrench} color="#7c3aed" catKey="Herramientas de Apoyo" />
        <RenderColumna titulo="Marcadores" icon={Bookmark} color="#64748b" catKey="Individuales" />
      </div>
    </div>
  );
};

export default Recursos;