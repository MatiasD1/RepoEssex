import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
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

      const [
        totalSnapshot,
        activeSnapshot,
        periodoSnapshot,
        usersSnapshot,
      ] = await Promise.all([
        getDocs(contractsRef),
        getDocs(query(contractsRef, where('status', '==', 'activo'))),
        getDocs(query(contractsRef, where('createdAt', '>=', startPeriodo))),
        getDocs(collection(db, 'users')),
      ]);

      // Map de UID a nombre
      const usersMap = {};
      usersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        usersMap[doc.id] = data.name || 'Sin nombre';
      });

      // Generar Top Vendedores y mapear nombre
      const topVendedores = calcularTopVendedores(totalSnapshot.docs).map(vendedor => ({
        nombre: usersMap[vendedor.uid] || vendedor.uid, // fallback UID si no hay nombre
        contratos: vendedor.contratos,
      }));

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
      .slice(0, 5);
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
        backgroundColor: ['#F8A145', '#D35100', '#ff8c19'],
      },
    ],
  };

  const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2,
  plugins: {
    legend: {
      labels: {
        color: '#ffc180',
        font: {
          size: 18,
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: '#ffc180',
        font: {
        size: 18,
      },
      },
      grid: {
        color: 'rgba(255,255,255,0.1)',
      },
    },
    y: {
      ticks: {
        color: '#ffc180',
        font: {
        size: 18,
      },
        
      },
      grid: {
        color: 'rgba(255,255,255,0.1)',
      },
    },
    
  },
};


  if (loading) return <div>Cargando...</div>;

  return (
  <div id="reports" className="reports-container">
    <h2 className="text-2xl font-bold mb-4">Panel de Estadísticas</h2>

    <div className="filter-buttons">
      <button 
        onClick={() => setPeriodo('mensual')} 
        className={periodo === 'mensual' ? 'active' : ''}
      >
        Mensual
      </button>
      <button 
        onClick={() => setPeriodo('anual')} 
        className={periodo === 'anual' ? 'active' : ''}
      >
        Anual
      </button>
    </div>

    <div className="chart-wrapper">
      <Chart className="chart" type="bar" data={chartData} options={chartOptions} />

    </div>

    <div className="top-vendedores">
      <h3>Top Vendedores</h3>
      <DataTable 
        value={stats.topVendedores}
        paginator 
        rows={5}
        rowClassName={(rowData) => {
          const index = stats.topVendedores.findIndex(v => v.uid === rowData.uid);
          return index % 2 === 0 ? 'fila-par' : 'fila-impar';
        }}
      >
        <Column field="nombre" header="Vendedor" />
        <Column field="contratos" header="Contratos Creados" sortable />
      </DataTable>
    </div>
  </div>
);
}

export default Reports;