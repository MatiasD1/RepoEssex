import  { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import {  auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { getUserContracts } from './FirebaseContrats';
import { formatDate } from './FirebaseContrats';

const Sellers = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const toast = useRef(null);
  const navigate = useNavigate();
  
  const columns = [
    { field: 'titulo', header: 'Título' },
    { field: 'contenido', header: 'Contenido' },
    { 
      field: 'createdAt', 
      header: 'Fecha Creación',
      body: (rowData) => {
        return formatDate(rowData.createdAt);
      }
    },
    { field: 'status', header: 'Estado' }
  ];

  const showError = (message) => {
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000
    });
  };

  useEffect(() => {

    const fetchContracts = async (userId) => {
      try {
        const contractsData = await getUserContracts(userId);
        if (!contractsData || contractsData.length === 0) {
          showError("No se encontraron contratos para este usuario");
          return;
        }
        // Formatear las fechas y otros campos si es necesario
        contractsData.forEach(contract => {
          contract.createdAt = formatDate(contract.createdAt);
          contract.fechaInicio = formatDate(contract.fechaInicio);
          contract.fechaFin = formatDate(contract.fechaFin);
        });  
        
        console.log("Contratos cargados:", contractsData);
        setContracts(contractsData);
      } catch (error) {
        console.error("Error detallado:", {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
        showError(`Error al cargar contratos: ${error.message}`);
        setContracts([]);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchContracts(user.uid);
      } else {
        setUser(null);
        setContracts([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center min-h-screen">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="card">
      <Toast ref={toast} />
      <h1 className="text-center">Bienvenido {user?.email || 'Usuario'}</h1>
      
      <div className="flex justify-content-between align-items-center mb-4">
        <h2>Mis Contratos</h2>
        
      </div>

      {contracts.length > 0 ? (
        <DataTable
          value={contracts}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          tableStyle={{ minWidth: '50rem' }}
          loading={loading}
          emptyMessage="No se encontraron contratos"
        >
          {columns.map((col) => (
            <Column
              key={col.field || col.header}
              field={col.field}
              header={col.header}
              sortable
              body={col.body}
            />
          ))}
        </DataTable>
      ) : (
        <div className="text-center py-4">
          {user ? (
            <>
              <p>No tienes contratos registrados</p>
              <Button 
                label="Crear primer contrato" 
                icon="pi pi-plus" 
                onClick={() => navigate('/sellers/new')}
                className="mt-2"
              />
            </>
          ) : (
            "Inicia sesión para ver tus contratos"
          )}
        </div>
      )}
    </div>
  );
};

export default Sellers;