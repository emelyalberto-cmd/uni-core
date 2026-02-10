import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Sparkles } from 'lucide-react';

const Pomodoro = () => {
  const [segundos, setSegundos] = useState(25 * 60);
  const [activo, setActivo] = useState(false);
  const [esDescanso, setEsDescanso] = useState(false);

  useEffect(() => {
    let intervalo = null;
    if (activo && segundos > 0) {
      intervalo = setInterval(() => setSegundos((s) => s - 1), 1000);
    } else if (segundos === 0) {
      const nuevoModo = !esDescanso;
      setEsDescanso(nuevoModo);
      setSegundos(nuevoModo ? 5 * 60 : 25 * 60);
      setActivo(false);
      // Alarma visual/sonora
      alert(nuevoModo ? "¡Sesión terminada! Toma un descanso de 5 min." : "¡Descanso terminado! A estudiar 25 min.");
    }
    return () => clearInterval(intervalo);
  }, [activo, segundos, esDescanso]);

  const formatearTiempo = (s) => {
    const m = Math.floor(s / 60);
    const seg = s % 60;
    return `${m}:${seg < 10 ? '0' : ''}${seg}`;
  };

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(30px)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    borderRadius: '50px',
    padding: '60px',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '0 auto',
    boxShadow: '0 30px 60px rgba(0,0,0,0.05)'
  };

  return (
    <div style={{ padding: '40px 20px', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={glassStyle}>
        <div style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', 
          borderRadius: '20px', background: esDescanso ? '#f0fdf4' : '#fef2f2', 
          color: esDescanso ? '#16a34a' : '#ef4444', fontSize: '12px', fontWeight: '900', 
          textTransform: 'uppercase', marginBottom: '30px' 
        }}>
          {esDescanso ? <Coffee size={16} /> : <BookOpen size={16} />}
          {esDescanso ? 'Modo Descanso' : 'Modo Enfoque'}
        </div>

        <h2 style={{ fontSize: '120px', fontWeight: '900', color: '#0f172a', margin: '0', letterSpacing: '-5px', fontFamily: 'monospace' }}>
          {formatearTiempo(segundos)}
        </h2>

        <p style={{ color: '#64748b', fontWeight: '500', marginTop: '10px', fontSize: '18px' }}>
          {esDescanso ? 'Relájate un poco antes de seguir.' : 'Concentración total para tus clases de inglés.'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px' }}>
          <button 
            onClick={() => setActivo(!activo)}
            style={{ 
              width: '80px', height: '80px', borderRadius: '50%', border: 'none', 
              background: '#0f172a', color: 'white', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 10px 20px rgba(15, 23, 42, 0.2)'
            }}
          >
            {activo ? <Pause size={30} /> : <Play size={30} style={{ marginLeft: '5px' }} />}
          </button>

          <button 
            onClick={() => { setActivo(false); setSegundos(esDescanso ? 5*60 : 25*60); }}
            style={{ 
              width: '80px', height: '80px', borderRadius: '50%', border: '1px solid #e2e8f0', 
              background: 'white', color: '#64748b', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <RotateCcw size={30} />
          </button>
        </div>
      </div>
      
      <div style={{ marginTop: '40px', color: '#94a3b8', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <Sparkles size={14} /> Técnica Pomodoro 25x5 integrada en UNI CORE
      </div>
    </div>
  );
};

export default Pomodoro;