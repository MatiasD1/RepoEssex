import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import {  auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ProgressSpinner } from 'primereact/progressspinner';
import { getUserContracts, deleteContract } from './FirebaseContrats';
import { formatDate } from './FirebaseContrats';
import { Button } from 'primereact/button';

const Sellers = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const toast = useRef(null);
  
  const columns = [
    { field: 'titulo', header: 'Título' },
    { field: 'contenido', header: 'Contenido' },
    { field: 'createdAt', header: 'Fecha Creación'},
    { field: 'status', header: 'Estado' },
    {
    header: 'Eliminar',
    body: (rowData) => (
      <Button 
        icon="pi pi-trash" 
        className="p-button-danger"
        onClick={() => handleDelete(rowData.id)}
      />
    )
  }   
  ];

  const showError = (message) => {
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000
    });
  };

  const handleDelete = async (contractId) => {
    try {
      await deleteContract(contractId);
      setContracts(prev => prev.filter(contract => contract.id !== contractId));
      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Contrato eliminado correctamente',
        life: 5000
      });
    } catch (error) {
      console.error("Error al eliminar contrato:", error);
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo eliminar el contrato',
        life: 5000
      });
    }
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
    </div>
  );
};

export default Sellers;