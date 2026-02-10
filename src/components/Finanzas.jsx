import React, { useState, useEffect } from 'react';
import { Sparkles, Wallet, RotateCcw, PlusCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const FinanzasSeccion = ({ tema, isMobile }) => {
  const [registros, setRegistros] = useState([]);
  const [ahorroTotal, setAhorroTotal] = useState(0);
  const [nuevo, setNuevo] = useState({ 
    descripcion: '', 
    monto: '', 
    tipo: 'gasto', 
    categoria: 'fijo',
    sale_de_ahorro: false 
  });

  useEffect(() => {
    fetchFinanzas();
    fetchAhorro();
  }, []);

  const fetchFinanzas = async () => {
    const { data } = await supabase.from('finanzas').select('*').order('created_at', { ascending: false });
    if (data) setRegistros(data);
  };

  const fetchAhorro = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('perfiles').select('ahorro_acumulado').eq('id', user.id).single();
    if (data) setAhorroTotal(data.ahorro_acumulado || 0);
  };

  const inyectarAhorro = async () => {
    const montoAInyectar = prompt("¿Cuánto deseas depositar en la Bóveda de Ahorros? (RD$)");
    if (montoAInyectar && !isNaN(montoAInyectar) && Number(montoAInyectar) > 0) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const nuevoTotal = ahorroTotal + Number(montoAInyectar);
        const { error: errorAhorro } = await supabase
          .from('perfiles')
          .upsert({ id: user.id, ahorro_acumulado: nuevoTotal });
        if (errorAhorro) throw errorAhorro;
        await supabase.from('finanzas').insert([{
          descripcion: "Depósito a Bóveda 🔒",
          monto: Number(montoAInyectar),
          tipo: 'gasto',
          categoria: 'fijo',
          user_id: user.id
        }]);
        setAhorroTotal(nuevoTotal);
        fetchFinanzas(); 
        alert("¡RD$ " + Number(montoAInyectar).toLocaleString() + " añadidos!");
      } catch (err) {
        alert("Error: " + err.message);
      }
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const montoNum = Number(nuevo.monto);
      if (nuevo.tipo === 'gasto' && nuevo.sale_de_ahorro) {
        const nuevoAhorro = ahorroTotal - montoNum;
        await supabase.from('perfiles').upsert({ id: user.id, ahorro_acumulado: nuevoAhorro });
        setAhorroTotal(nuevoAhorro);
      }
      const { data, error } = await supabase.from('finanzas').insert([{ 
        ...nuevo, monto: montoNum, user_id: user.id 
      }]).select();
      if (!error) { 
        setRegistros([data[0], ...registros]); 
        setNuevo({ descripcion: '', monto: '', tipo: 'gasto', categoria: 'fijo', sale_de_ahorro: false });
      }
    } catch (err) { alert("Error: " + err.message); }
  };

  const handleCerrarMes = async () => {
    if (window.confirm(`¿Cerrar mes?`)) {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('finanzas').delete().eq('user_id', user.id);
      setRegistros([]);
    }
  };

  const balanceMensual = registros.reduce((acc, curr) => curr.tipo === 'ingreso' ? acc + Number(curr.monto) : acc - Number(curr.monto), 0);

  // ESTILOS DINÁMICOS ADAPTATIVOS
  const glassStyle = { 
    background: tema.card, 
    backdropFilter: 'blur(25px)', 
    border: `1px solid ${tema.accent}30`, 
    borderRadius: '40px', 
    padding: '35px', 
    margin: '0 auto 30px auto',
    color: tema.text 
  };

  const inputStyle = { 
    width: '100%', maxWidth: '400px', padding: '15px', marginBottom: '10px', 
    border: `1px solid ${tema.accent}20`, borderRadius: '15px', outline: 'none', 
    background: tema.bg, color: tema.text, fontSize: '14px', display: 'block', margin: '0 auto 10px auto' 
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '20px 15px' : '40px 20px', textAlign: 'center' }}>
      <header style={{ marginBottom: '60px' }}>
        <h2 style={{ fontSize: isMobile ? '36px' : '52px', fontWeight: '900', color: tema.text, letterSpacing: '-2px', margin: '0' }}>
          Mis <span style={{ color: '#059669' }}>Finanzas</span>
        </h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px', flexWrap: 'wrap' }}>
          {/* BALANCE */}
          <div style={{ ...glassStyle, padding: '20px 40px', margin: 0, minWidth: isMobile ? '100%' : '260px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: tema.text, opacity: 0.6, display: 'block', textTransform: 'uppercase' }}>Balance del Mes</span>
            <div style={{ fontSize: '28px', fontWeight: '900', color: balanceMensual >= 0 ? '#059669' : '#ef4444' }}>
              RD$ {balanceMensual.toLocaleString()}
            </div>
          </div>

          {/* BÓVEDA */}
          <div style={{ ...glassStyle, padding: '20px 40px', margin: 0, border: `2px solid ${tema.accent}`, minWidth: isMobile ? '100%' : '260px', position: 'relative' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: tema.accent, display: 'block' }}>BÓVEDA DE AHORROS 🔒</span>
            <div style={{ fontSize: '28px', fontWeight: '900', color: tema.text }}>
              RD$ {ahorroTotal.toLocaleString()}
            </div>
            <button 
              onClick={inyectarAhorro}
              style={{ 
                position: 'absolute', top: '10px', right: '10px', background: tema.accent + '20', 
                border: 'none', borderRadius: '50%', cursor: 'pointer', padding: '8px', 
                color: tema.accent, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              title="Inyectar dinero"
            >
              <PlusCircle size={22} />
            </button>
          </div>
        </div>

        <button onClick={handleCerrarMes} style={{ marginTop: '25px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', color: tema.text, opacity: 0.5, border: `1px solid ${tema.text}30`, padding: '10px 25px', borderRadius: '15px', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}>
          <RotateCcw size={14} /> Reiniciar Mes
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
        <section>
          <div style={glassStyle}>
            <h3 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '30px', color: tema.text }}>Registrar Movimiento</h3>
            <form onSubmit={handleAdd}>
              <select style={inputStyle} value={nuevo.tipo} onChange={e => setNuevo({...nuevo, tipo: e.target.value})}>
                <option value="gasto">Gasto (Salida)</option>
                <option value="ingreso">Ingreso (Entrada)</option>
              </select>
              <input style={inputStyle} placeholder="Descripción" value={nuevo.descripcion} onChange={e => setNuevo({...nuevo, descripcion: e.target.value})} required />
              <input style={inputStyle} type="number" placeholder="Monto RD$" value={nuevo.monto} onChange={e => setNuevo({...nuevo, monto: e.target.value})} required />
              
              {nuevo.tipo === 'gasto' && (
                <div style={{ marginBottom: '20px' }}>
                  <select style={inputStyle} value={nuevo.categoria} onChange={e => setNuevo({...nuevo, categoria: e.target.value})}>
                    <option value="fijo">Gasto Fijo</option>
                    <option value="variable">Gasto Variable</option>
                    <option value="materiales">Universidad</option>
                    <option value="gustos">Gustos / Salidas</option>
                  </select>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: tema.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', background: tema.accent + '10', padding: '12px', borderRadius: '15px' }}>
                    <input type="checkbox" checked={nuevo.sale_de_ahorro} onChange={e => setNuevo({...nuevo, sale_de_ahorro: e.target.checked})} />
                    ¿Pagar usando mis Ahorros?
                  </label>
                </div>
              )}
              <button type="submit" style={{ width: '100%', maxWidth: '400px', padding: '18px', background: tema.accent, color: tema.bg, borderRadius: '20px', fontWeight: '900', border: 'none', cursor: 'pointer', marginTop: '10px' }}>
                GUARDAR REGISTRO
              </button>
            </form>
          </div>
        </section>

        <section style={{ maxHeight: '650px', overflowY: 'auto', paddingRight: '10px' }}>
          {registros.map(r => (
            <div key={r.id} style={{ ...glassStyle, padding: '25px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: '900', color: r.sale_de_ahorro ? tema.accent : tema.text, opacity: 0.8, textTransform: 'uppercase', background: r.sale_de_ahorro ? tema.accent + '20' : tema.text + '10', padding: '4px 10px', borderRadius: '10px' }}>
                  {r.sale_de_ahorro ? 'Ahorros 🔒' : r.categoria}
                </span>
                <h4 style={{ margin: '12px 0 5px 0', fontSize: '18px', fontWeight: '900', color: tema.text }}>{r.descripcion}</h4>
              </div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: r.tipo === 'ingreso' ? '#059669' : '#ef4444' }}>
                {r.tipo === 'ingreso' ? '+' : '-'} RD$ {Number(r.monto).toLocaleString()}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default FinanzasSeccion;