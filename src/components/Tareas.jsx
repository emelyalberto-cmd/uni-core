import React, { useState, useEffect } from 'react';
import { PlusCircle, CheckCircle, Clock, Trash2, Calendar, BookOpen, X, Sparkles } from 'lucide-react';
import { supabase } from '../supabaseClient';

const TareasSeccion = () => {
  const [tareas, setTareas] = useState([]);
  const [parciales, setParciales] = useState([]);
  const [materias, setMaterias] = useState([]);
  
  // Estados para controlar qué formulario mostrar
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

  const addTarea = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('tareas').insert([{ ...nuevaTarea, user_id: user.id }]);
    if (!error) {
      setNuevaTarea({ titulo: '', fecha_entrega: '', materia_id: '' });
      setFormTarea(false);
      fetchDatos();
    }
  };

  const addParcial = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('parciales').insert([{ ...nuevoParcial, user_id: user.id }]);
    if (!error) {
      setNuevoParcial({ fecha_examen: '', notas_estudio: '', materia_id: '' });
      setFormParcial(false);
      fetchDatos();
    }
  };

  const glassStyle = { background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.4)', borderRadius: '35px', padding: '30px', marginBottom: '30px' };
  const inputStyle = { width: '100%', padding: '12px', marginBottom: '10px', border: '1px solid #e2e8f0', borderRadius: '12px', outline: 'none', background: 'white' };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
      <header style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '42px', fontWeight: '900', color: '#0f172a', letterSpacing: '-2px' }}>Gestión de <span style={{ color: '#2563eb' }}>Pendientes</span></h2>
        
        {/* BOTONES DE ACCIÓN */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px' }}>
          <button 
            onClick={() => { setFormTarea(!formTarea); setFormParcial(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: formTarea ? '#f1f5f9' : '#2563eb', color: formTarea ? '#2563eb' : 'white', borderRadius: '15px', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '12px' }}
          >
            {formTarea ? <X size={16} /> : <PlusCircle size={16} />} NUEVA TAREA
          </button>
          
          <button 
            onClick={() => { setFormParcial(!formParcial); setFormTarea(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: formParcial ? '#f1f5f9' : '#ef4444', color: formParcial ? '#ef4444' : 'white', borderRadius: '15px', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '12px' }}
          >
            {formParcial ? <X size={16} /> : <Calendar size={16} />} NUEVO PARCIAL
          </button>
        </div>
      </header>

      {/* FORMULARIO TAREA */}
      <div style={{ maxHeight: formTarea ? '500px' : '0', overflow: 'hidden', transition: 'all 0.4s ease', opacity: formTarea ? 1 : 0 }}>
        <div style={{ ...glassStyle, maxWidth: '500px', margin: '0 auto 40px auto' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '20px' }}>Registrar Tarea</h3>
          <form onSubmit={addTarea}>
            <input style={inputStyle} placeholder="¿Qué hay que hacer?" value={nuevaTarea.titulo} onChange={e => setNuevaTarea({...nuevaTarea, titulo: e.target.value})} required />
            <input style={inputStyle} type="date" value={nuevaTarea.fecha_entrega} onChange={e => setNuevaTarea({...nuevaTarea, fecha_entrega: e.target.value})} required />
            <select style={inputStyle} value={nuevaTarea.materia_id} onChange={e => setNuevaTarea({...nuevaTarea, materia_id: e.target.value})} required>
              <option value="">Selecciona Materia</option>
              {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
            <button type="submit" style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', borderRadius: '12px', fontWeight: '800', border: 'none', marginTop: '10px' }}>GUARDAR TAREA</button>
          </form>
        </div>
      </div>

      {/* FORMULARIO PARCIAL */}
      <div style={{ maxHeight: formParcial ? '500px' : '0', overflow: 'hidden', transition: 'all 0.4s ease', opacity: formParcial ? 1 : 0 }}>
        <div style={{ ...glassStyle, maxWidth: '500px', margin: '0 auto 40px auto', border: '1px solid #fecaca' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '20px', color: '#ef4444' }}>Registrar Examen</h3>
          <form onSubmit={addParcial}>
            <input style={inputStyle} type="date" value={nuevoParcial.fecha_examen} onChange={e => setNuevoParcial({...nuevoParcial, fecha_examen: e.target.value})} required />
            <textarea style={{ ...inputStyle, height: '80px' }} placeholder="Temas a estudiar..." value={nuevoParcial.notas_estudio} onChange={e => setNuevoParcial({...nuevoParcial, notas_estudio: e.target.value})} />
            <select style={inputStyle} value={nuevoParcial.materia_id} onChange={e => setNuevoParcial({...nuevoParcial, materia_id: e.target.value})} required>
              <option value="">¿Para qué materia?</option>
              {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
            <button type="submit" style={{ width: '100%', padding: '12px', background: '#ef4444', color: 'white', borderRadius: '12px', fontWeight: '800', border: 'none', marginTop: '10px' }}>GUARDAR PARCIAL</button>
          </form>
        </div>
      </div>

      {/* LISTADO DE PENDIENTES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px', textAlign: 'left' }}>
        {/* COLUMNA TAREAS */}
        <section>
          <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#94a3b8', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18}/> TAREAS ACTIVAS</h3>
          {tareas.map(t => (
            <div key={t.id} style={{ ...glassStyle, padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: '900', color: '#2563eb', background: '#eff6ff', padding: '4px 10px', borderRadius: '10px' }}>{t.asignaturas?.nombre}</span>
                <h4 style={{ margin: '10px 0 5px 0', fontSize: '16px', fontWeight: '800' }}>{t.titulo}</h4>
                <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={12}/> {t.fecha_entrega}</div>
              </div>
            </div>
          ))}
        </section>

        {/* COLUMNA PARCIALES */}
        <section>
          <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#f87171', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={18}/> PRÓXIMOS EXÁMENES</h3>
          {parciales.map(p => (
            <div key={p.id} style={{ ...glassStyle, padding: '20px', borderLeft: '5px solid #ef4444', marginBottom: '15px' }}>
              <span style={{ fontSize: '10px', fontWeight: '900', color: '#ef4444', background: '#fef2f2', padding: '4px 10px', borderRadius: '10px' }}>{p.asignaturas?.nombre}</span>
              <h4 style={{ margin: '10px 0 5px 0', fontSize: '16px', fontWeight: '800' }}>Examen Parcial</h4>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '5px 0' }}>{p.notas_estudio}</p>
              <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={12}/> {p.fecha_examen}</div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default TareasSeccion;