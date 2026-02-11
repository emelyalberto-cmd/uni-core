import React, { useState, useEffect } from 'react';
import { PlusCircle, CheckCircle, Clock, Trash2, Calendar, BookOpen, X, Sparkles } from 'lucide-react';
import { supabase } from '../supabaseClient';

const TareasSeccion = ({ tema, isMobile }) => {
  const [tareas, setTareas] = useState([]);
  const [parciales, setParciales] = useState([]);
  const [materias, setMaterias] = useState([]);
  
  const [formTarea, setFormTarea] = useState(false);
  const [formParcial, setFormParcial] = useState(false);

  const [nuevaTarea, setNuevaTarea] = useState({ titulo: '', fecha_entrega: '', materia_id: '' });
  const [nuevoParcial, setNuevoParcial] = useState({ fecha_examen: '', notas_estudio: '', materia_id: '' });

  useEffect(() => {
    fetchDatos();
  }, []);

  const fetchDatos = async () => {
    const { data: t } = await supabase.from('tareas').select('*, asignaturas(nombre)').order('fecha_entrega', { ascending: true });
    const { data: p } = await supabase.from('parciales').select('*, asignaturas(nombre)').order('fecha_examen', { ascending: true });
    const { data: m } = await supabase.from('asignaturas').select('id, nombre');
    
    if (t) setTareas(t);
    if (p) setParciales(p);
    if (m) setMaterias(m);
  };

  // FUNCIÓN VISUAL ANTI-DESFASE PARA LAS LISTAS 🛡️
  const formatearFechaVista = (fechaRaw) => {
    if (!fechaRaw) return "";
    const limpia = fechaRaw.split('T')[0];
    const [y, m, d] = limpia.split('-');
    return `${d}/${m}/${y}`;
  };

  const addTarea = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // FORZAMOS MEDIODÍA AL GUARDAR PARA EVITAR EL ERROR DEL DÍA ANTERIOR 🛠️
      const fechaCorregida = nuevaTarea.fecha_entrega + "T12:00:00";

      const { error } = await supabase.from('tareas').insert([{ 
        titulo: nuevaTarea.titulo, 
        fecha_entrega: fechaCorregida, 
        materia_id: nuevaTarea.materia_id, 
        user_id: user.id 
      }]);

      if (error) throw error;

      setNuevaTarea({ titulo: '', fecha_entrega: '', materia_id: '' });
      setFormTarea(false);
      fetchDatos();
    } catch (err) {
      alert("Error al guardar tarea: " + err.message);
    }
  };

  const addParcial = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // FORZAMOS MEDIODÍA TAMBIÉN EN PARCIALES 🛠️
      const fechaCorregida = nuevoParcial.fecha_examen + "T12:00:00";

      const { error } = await supabase.from('parciales').insert([{ 
        fecha_examen: fechaCorregida, 
        notas_estudio: nuevoParcial.notas_estudio, 
        materia_id: nuevoParcial.materia_id, 
        user_id: user.id 
      }]);

      if (error) throw error;

      setNuevoParcial({ fecha_examen: '', notas_estudio: '', materia_id: '' });
      setFormParcial(false);
      fetchDatos();
    } catch (err) {
      alert("Error al guardar parcial: " + err.message);
    }
  };

  const eliminarDato = async (tabla, id) => {
    const { error } = await supabase.from(tabla).delete().eq('id', id);
    if (!error) fetchDatos();
  };

  const glassStyle = { 
    background: tema.card, 
    border: `1px solid ${tema.accent}30`, 
    borderRadius: '35px', 
    padding: '30px', 
    marginBottom: '30px',
    color: tema.text 
  };

  const inputStyle = { 
    width: '100%', 
    padding: '12px', 
    marginBottom: '10px', 
    border: `1px solid ${tema.accent}20`, 
    borderRadius: '12px', 
    outline: 'none', 
    background: tema.bg, 
    color: tema.text,
    fontSize: '14px',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '20px 15px' : '40px 20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '900', color: tema.text, letterSpacing: '-2px' }}>
          Gestión de <span style={{ color: tema.accent }}>Pendientes</span>
        </h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => { setFormTarea(!formTarea); setFormParcial(false); }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', 
              background: formTarea ? tema.accent + '20' : tema.accent, 
              color: formTarea ? tema.accent : tema.bg, 
              borderRadius: '15px', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '12px' 
            }}
          >
            {formTarea ? <X size={16} /> : <PlusCircle size={16} />} NUEVA TAREA
          </button>
          
          <button 
            onClick={() => { setFormParcial(!formParcial); setFormTarea(false); }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', 
              background: formParcial ? '#f8717120' : '#f87171', 
              color: formParcial ? '#f87171' : tema.bg, 
              borderRadius: '15px', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '12px' 
            }}
          >
            {formParcial ? <X size={16} /> : <Calendar size={16} />} NUEVO PARCIAL
          </button>
        </div>
      </header>

      {/* FORMULARIOS */}
      <div style={{ maxHeight: formTarea ? '600px' : '0', overflow: 'hidden', transition: 'all 0.4s ease', opacity: formTarea ? 1 : 0 }}>
        <div style={{ ...glassStyle, maxWidth: '500px', margin: '0 auto 40px auto' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '20px' }}>Registrar Tarea</h3>
          <form onSubmit={addTarea}>
            <input style={inputStyle} placeholder="¿Qué hay que hacer?" value={nuevaTarea.titulo} onChange={e => setNuevaTarea({...nuevaTarea, titulo: e.target.value})} required />
            <input style={inputStyle} type="date" value={nuevaTarea.fecha_entrega} onChange={e => setNuevaTarea({...nuevaTarea, fecha_entrega: e.target.value})} required />
            <select style={inputStyle} value={nuevaTarea.materia_id} onChange={e => setNuevaTarea({...nuevaTarea, materia_id: e.target.value})} required>
              <option value="">Selecciona Materia</option>
              {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
            <button type="submit" style={{ width: '100%', padding: '14px', background: tema.accent, color: tema.bg, borderRadius: '15px', fontWeight: '900', border: 'none', cursor: 'pointer' }}>GUARDAR TAREA</button>
          </form>
        </div>
      </div>

      <div style={{ maxHeight: formParcial ? '600px' : '0', overflow: 'hidden', transition: 'all 0.4s ease', opacity: formParcial ? 1 : 0 }}>
        <div style={{ ...glassStyle, maxWidth: '500px', margin: '0 auto 40px auto', border: '1px solid #f8717150' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '20px', color: '#f87171' }}>Registrar Examen</h3>
          <form onSubmit={addParcial}>
            <input style={inputStyle} type="date" value={nuevoParcial.fecha_examen} onChange={e => setNuevoParcial({...nuevoParcial, fecha_examen: e.target.value})} required />
            <textarea style={{ ...inputStyle, height: '80px' }} placeholder="Temas a estudiar..." value={nuevoParcial.notas_estudio} onChange={e => setNuevoParcial({...nuevoParcial, notas_estudio: e.target.value})} />
            <select style={inputStyle} value={nuevoParcial.materia_id} onChange={e => setNuevoParcial({...nuevoParcial, materia_id: e.target.value})} required>
              <option value="">¿Para qué materia?</option>
              {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
            <button type="submit" style={{ width: '100%', padding: '14px', background: '#f87171', color: tema.bg, borderRadius: '15px', fontWeight: '900', border: 'none', cursor: 'pointer' }}>GUARDAR PARCIAL</button>
          </form>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px' }}>
        {/* COLUMNA TAREAS */}
        <section>
          <h3 style={{ fontSize: '14px', fontWeight: '900', color: tema.accent, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18}/> TAREAS ACTIVAS
          </h3>
          {tareas.filter(t => !t.completada).map(t => (
            <div key={t.id} style={{ ...glassStyle, padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '10px', fontWeight: '900', color: tema.bg, background: tema.accent, padding: '4px 10px', borderRadius: '10px' }}>
                  {t.asignaturas?.nombre || 'General'}
                </span>
                <h4 style={{ margin: '10px 0 5px 0', fontSize: '16px', fontWeight: '800' }}>{t.titulo}</h4>
                <div style={{ fontSize: '12px', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={12}/> {formatearFechaVista(t.fecha_entrega)}
                </div>
              </div>
              <button onClick={() => eliminarDato('tareas', t.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '10px' }}>
                <Trash2 size={18}/>
              </button>
            </div>
          ))}
        </section>

        {/* COLUMNA PARCIALES */}
        <section>
          <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#f87171', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18}/> PRÓXIMOS EXÁMENES
          </h3>
          {parciales.map(p => (
            <div key={p.id} style={{ ...glassStyle, padding: '20px', borderLeft: '5px solid #f87171', marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '10px', fontWeight: '900', color: '#f87171', background: '#f8717120', padding: '4px 10px', borderRadius: '10px' }}>
                  {p.asignaturas?.nombre || 'General'}
                </span>
                <h4 style={{ margin: '10px 0 5px 0', fontSize: '16px', fontWeight: '800' }}>Examen Parcial</h4>
                <p style={{ fontSize: '12px', opacity: 0.7, margin: '5px 0' }}>{p.notas_estudio}</p>
                <div style={{ fontSize: '12px', color: '#f87171', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={12}/> {formatearFechaVista(p.fecha_examen)}
                </div>
              </div>
              <button onClick={() => eliminarDato('parciales', p.id)} style={{ background: 'none', border: 'none', color: '#f87171', opacity: 0.5, cursor: 'pointer', height: 'fit-content' }}>
                <Trash2 size={18}/>
              </button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default TareasSeccion;