import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Chart } from 'primereact/chart';
import { startOfMonth, startOfYear } from 'date-fns';

const Reports = () => {
  const [stats, setStats] = useState({
    totalContratos: 0,
    contratosActivos: 0,
    contratosPeriodo: 0, // Cambiado a genérico para mes/año
    topVendedores: [],
  });
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('mensual');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const contractsRef = collection(db, 'contracts');
        const now = new Date();
        const startPeriodo = periodo === 'mensual' 
          ? startOfMonth(now) 
          : startOfYear(now);

        // Consultas en paralelo para eficiencia
        const [
          totalSnapshot,
          activeSnapshot,
          periodoSnapshot,
          // eslint-disable-next-line no-unused-vars
          vendedoresSnapshot,
        ] = await Promise.all([
          getDocs(contractsRef),
          getDocs(query(contractsRef, where('status', '==', 'activo'))),
          getDocs(query(contractsRef, where('createdAt', '>=', startPeriodo))),
          getDocs(collection(db, 'users')),
        ]);

        // Procesar datos
        const topVendedores = calcularTopVendedores(totalSnapshot.docs);
        
        setStats({
          totalContratos: totalSnapshot.size,
          contratosActivos: activeSnapshot.size,
          contratosPeriodo: periodoSnapshot.size,
          topVendedores,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };

    const calcularTopVendedores = (docs) => {
      const vendedoresMap = {};
      docs.forEach(doc => {
        const creadorUID = doc.data().userUID;
        if (vendedoresMap[creadorUID]) {
          vendedoresMap[creadorUID].contratos++;
        } else {
          vendedoresMap[creadorUID] = { uid: creadorUID, contratos: 1 };
        }
      });
      return Object.values(vendedoresMap)
        .sort((a, b) => b.contratos - a.contratos)
        .slice(0, 5); // Top 5
    };

    fetchStats();
  }, [periodo]);

  // Datos para gráficos
  const chartData = {
    labels: ['Contratos Totales', 'Activos', `Este ${periodo === 'mensual' ? 'Mes' : 'Año'}`],
    datasets: [
      {
        label: 'Resumen',
        data: [stats.totalContratos, stats.contratosActivos, stats.contratosPeriodo],
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'],
      },
    ],
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="p-4">
      <h2>Panel de Estadísticas</h2>
      
      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setPeriodo('mensual')} 
          className={`p-2 ${periodo === 'mensual' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Mensual
        </button>
        <button 
          onClick={() => setPeriodo('anual')} 
          className={`p-2 ${periodo === 'anual' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Anual
        </button>
      </div>

      {/* Gráfico */}
      <div className="card p-4 shadow mb-6">
        <Chart 
          type="bar" 
          data={chartData} 
          options={{ responsive: true }} 
        />
      </div>

      {/* Tabla Top Vendedores */}
      <div className="card p-4 shadow">
        <h3>Top Vendedores</h3>
        <DataTable value={stats.topVendedores} paginator rows={5}>
          <Column field="uid" header="UID" />
          <Column field="contratos" header="Contratos Creados" sortable />
        </DataTable>
      </div>
    </div>
  );
};

export default Reports;
