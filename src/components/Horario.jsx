import React, { useState, useEffect } from 'react';
import { PlusCircle, Clock, User, MapPin, Sparkles, BookOpen, Trash2, Edit2, Check, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Horario = ({ tema, isMobile }) => {
  const [materias, setMaterias] = useState([]);
  const [nueva, setNueva] = useState({ nombre: '', horario: '', aula: '', docente: '', codigo: '' });
  const [editando, setEditando] = useState(null); 
  const [mostrarForm, setMostrarForm] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('asignaturas').select('*').order('created_at', { ascending: false });
      if (data) setMaterias(data);
    };
    load();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('asignaturas').insert([{ ...nueva, user_id: user.id }]).select();
    if (!error) {
      setMaterias(prev => [data[0], ...prev]);
      setNueva({ nombre: '', horario: '', aula: '', docente: '', codigo: '' });
      setMostrarForm(false);
    }
  };

  const handleEliminar = async (id) => {
    const { error } = await supabase.from('asignaturas').delete().eq('id', id);
    if (!error) setMaterias(materias.filter(m => m.id !== id));
  };

  const handleActualizar = async (materiaActualizada) => {
    const { error } = await supabase.from('asignaturas').update(materiaActualizada).eq('id', materiaActualizada.id);
    if (!error) {
      setMaterias(materias.map(m => m.id === materiaActualizada.id ? materiaActualizada : m));
      setEditando(null);
    }
  };

  // ESTILOS DINÁMICOS (Responden al tema)
  const glassStyle = {
    background: tema.card, // Usa el fondo del tema
    backdropFilter: 'blur(20px)',
    border: `1px solid ${tema.accent}30`, // Borde sutil del color acento
    borderRadius: '40px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
    padding: isMobile ? '25px' : '40px',
    margin: '0 auto',
    color: tema.text // Asegura que el texto base sea el del tema
  };

  const inputStyle = {
    width: '100%', maxWidth: '400px', padding: '12px', marginBottom: '10px',
    border: `1px solid ${tema.accent}20`, borderRadius: '12px', outline: 'none',
    background: tema.bg, color: tema.text, fontSize: '13px', display: 'block', margin: '0 auto 10px auto'
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '20px 15px' : '40px 20px', textAlign: 'center' }}>
      <header style={{ marginBottom: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ fontSize: isMobile ? '36px' : '48px', fontWeight: '900', color: tema.text, letterSpacing: '-2px', margin: '0' }}>
          Mi <span style={{ color: tema.accent }}>Horario</span>
        </h2>
        <p style={{ color: tema.text, opacity: 0.6, fontWeight: '500', marginBottom: '25px' }}>Control académico total.</p>
        
        <button 
          onClick={() => setMostrarForm(!mostrarForm)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 25px', 
            background: mostrarForm ? tema.accent + '20' : tema.accent, 
            color: mostrarForm ? tema.text : tema.bg, // Contraste inteligente
            borderRadius: '20px', fontWeight: '900', border: 'none', cursor: 'pointer',
            transition: '0.3s', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px'
          }}
        >
          {mostrarForm ? <X size={16} /> : <PlusCircle size={16} />}
          {mostrarForm ? 'Cerrar Registro' : 'Inscribir Materia'}
        </button>
      </header>

      {/* Formulario Desplegable */}
      <div style={{ 
        maxHeight: mostrarForm ? '1000px' : '0', 
        overflow: 'hidden', 
        transition: 'all 0.5s ease',
        opacity: mostrarForm ? 1 : 0,
        marginBottom: mostrarForm ? '50px' : '0'
      }}>
        <div style={{ ...glassStyle, maxWidth: '600px' }}>
          <h3 style={{ margin: '0 0 25px 0', fontSize: '20px', fontWeight: '900', color: tema.text }}>Inscribir Asignatura</h3>
          <form onSubmit={handleAdd}>
            <input style={inputStyle} placeholder="Nombre de la Materia" value={nueva.nombre} onChange={e => setNueva({...nueva, nombre: e.target.value})} required />
            <input style={inputStyle} placeholder="Código (ej. UCNE-101)" value={nueva.codigo} onChange={e => setNueva({...nueva, codigo: e.target.value})} />
            <input style={inputStyle} placeholder="Docente" value={nueva.docente} onChange={e => setNueva({...nueva, docente: e.target.value})} />
            <input style={inputStyle} placeholder="Aula" value={nueva.aula} onChange={e => setNueva({...nueva, aula: e.target.value})} />
            <input style={inputStyle} placeholder="Horario" value={nueva.horario} onChange={e => setNueva({...nueva, horario: e.target.value})} />
            <button type="submit" style={{ padding: '15px 40px', background: tema.accent, color: tema.bg, borderRadius: '15px', fontWeight: '900', border: 'none', cursor: 'pointer', marginTop: '10px' }}>
              GUARDAR MATERIA
            </button>
          </form>
        </div>
      </div>

      {/* Grid de Materias */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
        {materias.map((m) => (
          <div key={m.id} style={glassStyle}>
            {editando === m.id ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <input style={inputStyle} value={m.nombre} onChange={e => setMaterias(materias.map(item => item.id === m.id ? {...item, nombre: e.target.value} : item))} />
                <input style={inputStyle} value={m.codigo} onChange={e => setMaterias(materias.map(item => item.id === m.id ? {...item, codigo: e.target.value} : item))} />
                <input style={inputStyle} value={m.docente} onChange={e => setMaterias(materias.map(item => item.id === m.id ? {...item, docente: e.target.value} : item))} />
                <input style={inputStyle} value={m.horario} onChange={e => setMaterias(materias.map(item => item.id === m.id ? {...item, horario: e.target.value} : item))} />
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
                  <button onClick={() => handleActualizar(m)} style={{ background: '#22c55e', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>
                    <Check size={18} />
                  </button>
                  <button onClick={() => setEditando(null)} style={{ background: '#ef4444', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '900', background: tema.accent, color: tema.bg, padding: '4px 12px', borderRadius: '10px' }}>
                    {m.codigo || 'UCNE'}
                  </span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Edit2 size={16} style={{ color: tema.text, opacity: 0.4, cursor: 'pointer' }} onClick={() => setEditando(m.id)} />
                    <Trash2 size={16} style={{ color: '#fca5a5', cursor: 'pointer' }} onClick={() => handleEliminar(m.id)} />
                  </div>
                </div>
                <h4 style={{ fontSize: '26px', fontWeight: '900', color: tema.text, margin: '0 0 20px 0' }}>{m.nombre}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                  <div style={{ color: tema.text, opacity: 0.7, fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={14} /> {m.docente}
                  </div>
                  <div style={{ color: tema.text, opacity: 0.7, fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} /> {m.aula}
                  </div>
                  <div style={{ 
                    background: tema.accent + '15', 
                    padding: '12px 20px', 
                    borderRadius: '15px', 
                    color: tema.accent, 
                    fontSize: '14px', 
                    fontWeight: '900', 
                    marginTop: '10px',
                    border: `1px solid ${tema.accent}30`
                  }}>
                    {m.horario}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Horario;