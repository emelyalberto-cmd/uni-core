import React, { useState, useEffect } from 'react';
import { Sparkles, Wallet, RotateCcw, PlusCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const FinanzasSeccion = () => {
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
        alert("¡RD$ " + Number(montoAInyectar).toLocaleString() + " añadidos a tu Bóveda!");
      } catch (err) {
        alert("Error al inyectar: " + err.message);
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
        const { error: errorAhorro } = await supabase
          .from('perfiles')
          .upsert({ id: user.id, ahorro_acumulado: nuevoAhorro, updated_at: new Date() });
        
        if (errorAhorro) throw errorAhorro;
        setAhorroTotal(nuevoAhorro);
      }

      const { data, error } = await supabase.from('finanzas').insert([{ 
        descripcion: nuevo.descripcion,
        monto: montoNum,
        tipo: nuevo.tipo,
        categoria: nuevo.tipo === 'ingreso' ? 'Ingreso Directo' : nuevo.categoria,
        sale_de_ahorro: nuevo.sale_de_ahorro,
        user_id: user.id 
      }]).select();

      if (error) throw error;

      if (data) { 
        setRegistros([data[0], ...registros]); 
        setNuevo({ descripcion: '', monto: '', tipo: 'gasto', categoria: 'fijo', sale_de_ahorro: false });
        alert("¡Registro guardado!");
      }

    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleCerrarMes = async () => {
    const confirmar = window.confirm(`¿Cerrar mes? Tus ahorros seguirán intactos.`);
    if (confirmar) {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('finanzas').delete().eq('user_id', user.id);
      if (!error) setRegistros([]);
    }
  };

  const balanceMensual = registros.reduce((acc, curr) => curr.tipo === 'ingreso' ? acc + Number(curr.monto) : acc - Number(curr.monto), 0);

  const glassStyle = { background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(25px)', border: '1px solid rgba(255, 255, 255, 0.4)', borderRadius: '40px', padding: '35px', margin: '0 auto 30px auto' };
  const inputStyle = { width: '100%', maxWidth: '400px', padding: '15px', marginBottom: '10px', border: '1px solid #e2e8f0', borderRadius: '15px', outline: 'none', background: 'white', fontSize: '14px', display: 'block', margin: '0 auto 10px auto' };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '60px' }}>
        <h2 style={{ fontSize: '52px', fontWeight: '900', color: '#0f172a', letterSpacing: '-2px', margin: '0' }}>
          Mis <span style={{ color: '#059669' }}>Finanzas</span>
        </h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
          {/* BALANCE DEL MES */}
          <div style={{ ...glassStyle, padding: '20px 40px', margin: 0, minWidth: '240px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', display: 'block' }}>BALANCE DEL MES</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: balanceMensual >= 0 ? '#059669' : '#ef4444' }}>
              RD$ {balanceMensual.toLocaleString()}
            </div>
          </div>

          {/* BÓVEDA DE AHORROS (CON EL BOTÓN AQUÍ) */}
          <div style={{ ...glassStyle, padding: '20px 40px', margin: 0, border: '2px solid #2563eb', minWidth: '240px', position: 'relative' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#2563eb', display: 'block' }}>BÓVEDA DE AHORROS 🔒</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b' }}>
              RD$ {ahorroTotal.toLocaleString()}
            </div>
            {/* BOTÓN REUBICADO: Ahora encima de la Bóveda */}
            <button 
              onClick={inyectarAhorro}
              style={{ 
                position: 'absolute', top: '10px', right: '10px', background: '#eff6ff', 
                border: 'none', borderRadius: '50%', cursor: 'pointer', padding: '6px', 
                color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: '0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              title="Inyectar dinero a la bóveda"
            >
              <PlusCircle size={20} />
            </button>
          </div>
        </div>

        <button onClick={handleCerrarMes} style={{ marginTop: '25px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'white', color: '#64748b', border: '1px solid #e2e8f0', padding: '10px 25px', borderRadius: '15px', fontSize: '11px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase' }}>
          <RotateCcw size={14} /> Reiniciar Mes
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
        <section>
          <div style={glassStyle}>
            <h3 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '30px', color: '#1e293b' }}>Registrar Movimiento</h3>
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
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', background: '#eff6ff', padding: '10px', borderRadius: '12px' }}>
                    <input type="checkbox" checked={nuevo.sale_de_ahorro} onChange={e => setNuevo({...nuevo, sale_de_ahorro: e.target.checked})} />
                    ¿Pagar usando mis Ahorros?
                  </label>
                </div>
              )}
              <button type="submit" style={{ width: '100%', maxWidth: '400px', padding: '18px', background: '#0f172a', color: 'white', borderRadius: '20px', fontWeight: '900', border: 'none', cursor: 'pointer', marginTop: '10px' }}>
                GUARDAR REGISTRO
              </button>
            </form>
          </div>
        </section>

        <section style={{ maxHeight: '650px', overflowY: 'auto', paddingRight: '15px' }}>
          {registros.map(r => (
            <div key={r.id} style={{ ...glassStyle, padding: '25px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: '900', color: r.sale_de_ahorro ? '#2563eb' : '#64748b', textTransform: 'uppercase', background: r.sale_de_ahorro ? '#eff6ff' : '#f1f5f9', padding: '4px 10px', borderRadius: '10px' }}>
                  {r.sale_de_ahorro ? 'Ahorros 🔒' : r.categoria}
                </span>
                <h4 style={{ margin: '12px 0 5px 0', fontSize: '18px', fontWeight: '900', color: '#1e293b' }}>{r.descripcion}</h4>
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