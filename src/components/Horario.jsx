import React, { useState, useEffect } from 'react';
import { PlusCircle, Clock, User, MapPin, Trash2, Edit2, Check, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Horario = ({ tema, isMobile }) => {
  const [materias, setMaterias] = useState([]);
  const [nueva, setNueva] = useState({ 
    nombre: '', aula: '', docente: '', codigo: '', 
    dia: 'Lunes', hora_inicio: '08:00', hora_fin: '10:00' 
  });
  const [editando, setEditando] = useState(null); 
  const [materiaEdit, setMateriaEdit] = useState({}); 
  const [mostrarForm, setMostrarForm] = useState(false);

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // FUNCIÓN PARA FORMATO 12 HORAS (AM/PM) ✅
  const formatearHoraAMPM = (hora24) => {
    if (!hora24) return "---";
    // Si la base de datos devuelve segundos (08:00:00), los quitamos
    let [horasRaw, minutos] = hora24.split(':');
    let horas = parseInt(horasRaw);
    const ampm = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12 || 12;
    return `${horas}:${minutos} ${ampm}`;
  };

  useEffect(() => {
    fetchMaterias();
  }, []);

  const fetchMaterias = async () => {
    // Ordenamos primero por el campo 'dia' y luego por 'hora_inicio'
    const { data } = await supabase.from('asignaturas').select('*').order('dia').order('hora_inicio');
    if (data) setMaterias(data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      // Insertamos en las nuevas columnas: dia, hora_inicio, hora_fin
      const { data, error } = await supabase.from('asignaturas').insert([{ ...nueva, user_id: user.id }]).select();
      
      if (error) throw error;

      if (data) {
        setMaterias(prev => [...prev, data[0]]);
        setNueva({ nombre: '', aula: '', docente: '', codigo: '', dia: 'Lunes', hora_inicio: '08:00', hora_fin: '10:00' });
        setMostrarForm(false);
      }
    } catch (err) {
      alert("Error al guardar: " + err.message);
    }
  };

  const handleEliminar = async (id) => {
    if(window.confirm("¿Eliminar esta asignatura?")) {
        const { error } = await supabase.from('asignaturas').delete().eq('id', id);
        if (!error) setMaterias(materias.filter(m => m.id !== id));
    }
  };

  const iniciarEdicion = (m) => {
    setEditando(m.id);
    setMateriaEdit({...m}); 
  };

  const handleActualizar = async () => {
    try {
      const { error } = await supabase.from('asignaturas').update(materiaEdit).eq('id', materiaEdit.id);
      if (error) throw error;
      
      setMaterias(materias.map(item => item.id === materiaEdit.id ? materiaEdit : item));
      setEditando(null);
    } catch (err) {
      alert("Error al actualizar: " + err.message);
    }
  };

  const glassStyle = {
    background: tema.card, backdropFilter: 'blur(20px)', border: `1px solid ${tema.accent}30`,
    borderRadius: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
    padding: isMobile ? '25px' : '40px', margin: '0 auto', color: tema.text
  };

  const inputStyle = {
    width: '100%', maxWidth: '400px', padding: '12px', marginBottom: '10px',
    border: `1px solid ${tema.accent}20`, borderRadius: '12px', outline: 'none',
    background: tema.bg, color: tema.text, fontSize: '13px', display: 'block', margin: '0 auto 10px auto'
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '20px 15px' : '40px 20px', textAlign: 'center' }}>
      <header style={{ marginBottom: '50px' }}>
        <h2 style={{ fontSize: isMobile ? '36px' : '48px', fontWeight: '900', color: tema.text, margin: '0' }}>
          Mi <span style={{ color: tema.accent }}>Horario</span>
        </h2>
        <button 
          onClick={() => setMostrarForm(!mostrarForm)} 
          style={{ marginTop: '20px', padding: '12px 25px', background: tema.accent, color: tema.bg, borderRadius: '20px', fontWeight: '900', border: 'none', cursor: 'pointer' }}
        >
          {mostrarForm ? 'CERRAR' : 'AÑADIR CLASE'}
        </button>
      </header>

      {/* FORMULARIO DE REGISTRO */}
      {mostrarForm && (
        <div style={{ ...glassStyle, maxWidth: '600px', marginBottom: '50px' }}>
          <form onSubmit={handleAdd}>
            <input style={inputStyle} placeholder="Nombre de Materia" value={nueva.nombre} onChange={e => setNueva({...nueva, nombre: e.target.value})} required />
            <input style={inputStyle} placeholder="Código (ej. UCNE-101)" value={nueva.codigo} onChange={e => setNueva({...nueva, codigo: e.target.value})} />
            <select style={inputStyle} value={nueva.dia} onChange={e => setNueva({...nueva, dia: e.target.value})}>
              {diasSemana.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '15px', maxWidth: '400px', margin: '0 auto 10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '10px', fontWeight: '800', opacity: 0.6 }}>INICIO</label>
                <input type="time" style={{ ...inputStyle, margin: 0 }} value={nueva.hora_inicio} onChange={e => setNueva({...nueva, hora_inicio: e.target.value})} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '10px', fontWeight: '800', opacity: 0.6 }}>FIN</label>
                <input type="time" style={{ ...inputStyle, margin: 0 }} value={nueva.hora_fin} onChange={e => setNueva({...nueva, hora_fin: e.target.value})} />
              </div>
            </div>
            <input style={inputStyle} placeholder="Aula" value={nueva.aula} onChange={e => setNueva({...nueva, aula: e.target.value})} />
            <input style={inputStyle} placeholder="Docente" value={nueva.docente} onChange={e => setNueva({...nueva, docente: e.target.value})} />
            <button type="submit" style={{ padding: '15px 40px', background: tema.accent, color: tema.bg, borderRadius: '15px', fontWeight: '900', border: 'none', cursor: 'pointer' }}>GUARDAR</button>
          </form>
        </div>
      )}

      {/* GRID DE MATERIAS */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
        {materias.map((m) => (
          <div key={m.id} style={glassStyle}>
            {editando === m.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <input style={inputStyle} value={materiaEdit.nombre} onChange={e => setMateriaEdit({...materiaEdit, nombre: e.target.value})} />
                <input style={inputStyle} value={materiaEdit.codigo} onChange={e => setMateriaEdit({...materiaEdit, codigo: e.target.value})} />
                <select style={inputStyle} value={materiaEdit.dia} onChange={e => setMateriaEdit({...materiaEdit, dia: e.target.value})}>
                  {diasSemana.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="time" style={inputStyle} value={materiaEdit.hora_inicio} onChange={e => setMateriaEdit({...materiaEdit, hora_inicio: e.target.value})} />
                  <input type="time" style={inputStyle} value={materiaEdit.hora_fin} onChange={e => setMateriaEdit({...materiaEdit, hora_fin: e.target.value})} />
                </div>
                <input style={inputStyle} value={materiaEdit.aula} onChange={e => setMateriaEdit({...materiaEdit, aula: e.target.value})} />
                <input style={inputStyle} value={materiaEdit.docente} onChange={e => setMateriaEdit({...materiaEdit, docente: e.target.value})} />
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button onClick={handleActualizar} style={{ background: '#22c55e', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}><Check size={18} /></button>
                  <button onClick={() => setEditando(null)} style={{ background: '#ef4444', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '900', background: tema.accent, color: tema.bg, padding: '4px 12px', borderRadius: '10px' }}>
                    {m.dia}
                  </span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Edit2 size={16} style={{ color: tema.text, opacity: 0.4, cursor: 'pointer' }} onClick={() => iniciarEdicion(m)} />
                    <Trash2 size={16} style={{ color: '#fca5a5', cursor: 'pointer' }} onClick={() => handleEliminar(m.id)} />
                  </div>
                </div>
                <h4 style={{ fontSize: '22px', fontWeight: '900', color: tema.text, margin: '0' }}>{m.nombre}</h4>
                <div style={{ fontSize: '11px', fontWeight: '800', color: tema.accent, marginBottom: '15px' }}>{m.codigo || 'UCNE'}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7 }}>
                    <Clock size={14}/> {formatearHoraAMPM(m.hora_inicio)} - {formatearHoraAMPM(m.hora_fin)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7 }}><MapPin size={14}/> {m.aula || 'No asignada'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7 }}><User size={14}/> {m.docente || 'Sin docente'}</div>
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