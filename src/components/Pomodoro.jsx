import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Sparkles } from 'lucide-react';

const Pomodoro = ({ tema, isMobile }) => {
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
      alert(nuevoModo ? "¡Sesión terminada! Toma un descanso de 5 min." : "¡Descanso terminado! A estudiar 25 min.");
    }
    return () => clearInterval(intervalo);
  }, [activo, segundos, esDescanso]);

  const formatearTiempo = (s) => {
    const m = Math.floor(s / 60);
    const seg = s % 60;
    return `${m}:${seg < 10 ? '0' : ''}${seg}`;
  };

  // ESTILOS QUE RESPONDEN AL TEMA
  const glassStyle = {
    background: tema.card,
    backdropFilter: 'blur(30px)',
    border: `1px solid ${tema.accent}30`,
    borderRadius: isMobile ? '40px' : '50px',
    padding: isMobile ? '40px 20px' : '60px',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '0 auto',
    boxShadow: '0 30px 60px rgba(0,0,0,0.1)',
    color: tema.text
  };

  return (
    <div style={{ padding: '40px 20px', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={glassStyle}>
        {/* INDICADOR DE MODO */}
        <div style={{ 
          display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', 
          borderRadius: '20px', 
          background: esDescanso ? '#22c55e20' : tema.accent + '20', 
          color: esDescanso ? '#22c55e' : tema.accent, 
          fontSize: '12px', fontWeight: '900', 
          textTransform: 'uppercase', marginBottom: '30px',
          border: `1px solid ${esDescanso ? '#22c55e40' : tema.accent + '40'}`
        }}>
          {esDescanso ? <Coffee size={16} /> : <BookOpen size={16} />}
          {esDescanso ? 'Modo Descanso' : 'Modo Enfoque'}
        </div>

        {/* RELOJ GIGANTE - AHORA DINÁMICO */}
        <h2 style={{ 
          fontSize: isMobile ? '80px' : '120px', 
          fontWeight: '900', 
          color: tema.text, // Se adapta al fondo negro o blanco
          margin: '0', 
          letterSpacing: '-5px', 
          fontFamily: 'monospace' 
        }}>
          {formatearTiempo(segundos)}
        </h2>

        <p style={{ color: tema.text, opacity: 0.6, fontWeight: '500', marginTop: '10px', fontSize: isMobile ? '14px' : '18px' }}>
          {esDescanso ? 'Relájate un poco antes de seguir.' : 'Concentración total para tus clases.'}
        </p>

        {/* CONTROLES */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px' }}>
          <button 
            onClick={() => setActivo(!activo)}
            style={{ 
              width: '80px', height: '80px', borderRadius: '50%', border: 'none', 
              background: tema.accent, // Usa el color principal del tema
              color: tema.bg, // El icono toma el color del fondo para contrastar
              cursor: 'pointer', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 10px 20px ${tema.accent}40`,
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            {activo ? <Pause size={30} /> : <Play size={30} style={{ marginLeft: '5px' }} />}
          </button>

          <button 
            onClick={() => { setActivo(false); setSegundos(esDescanso ? 5*60 : 25*60); }}
            style={{ 
              width: '80px', height: '80px', borderRadius: '50%', 
              border: `1px solid ${tema.text}20`, 
              background: 'transparent', 
              color: tema.text, 
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0.7
            }}
          >
            <RotateCcw size={30} />
          </button>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '40px', 
        color: tema.text, 
        opacity: 0.4, 
        fontSize: '13px', 
        fontWeight: '600', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '8px' 
      }}>
        <Sparkles size={14} /> Técnica Pomodoro 25x5 integrada en UNI CORE
      </div>
    </div>
  );
};

export default Pomodoro;