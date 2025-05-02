import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Navbar from './Navbar';
import { ProgressSpinner } from 'primereact/progressspinner';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Columnas optimizadas
  const columns = [
    { field: 'email', header: 'Email' },
    { field: 'role', header: 'Rol' },
    { field: 'id', header: 'ID' }
  ];

  useEffect(() => {
    // Solo carga todos los usuarios (ya validamos que es admin)
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading users:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
        <div className="flex justify-content-center align-items-center" style={{ height: '60px' }}>
            <ProgressSpinner style={{ width: '40px', height: '40px' }} />
        </div>
    );
}

  return (
    <div className="p-4">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
      
      <DataTable
        value={users}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25]}
        tableStyle={{ minWidth: '50rem' }}
      >
        {columns.map((col) => (
          <Column 
            key={col.field} 
            field={col.field} 
            header={col.header} 
            sortable 
          />
        ))}
      </DataTable>
    </div>
  );
};

export default Admin;