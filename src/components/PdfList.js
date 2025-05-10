import React, { useEffect, useState,useRef } from 'react';
import { getUserContracts } from './FirebaseContrats';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const PdfList = () => {

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useRef(null);
  const columns =[
    { field: 'userUID', header: 'ID' },
    { field: 'titulo', header: 'titulo' },
    { field: 'status', header: 'Estado' },
    { field: 'createdAt', header: 'Fecha de Creación' },
    // Agrega más columnas según sea necesario
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
    const fetchContracts = async () => {
          try {        
            const querySnapshot = await getUserContracts();
            
            if (querySnapshot.empty) {
              console.log("No se encontraron contratos para este usuario");
              setContracts([]);
              return;
            }
            
            const contractsData = querySnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                // Aseguramos que createdAt sea manejable
                createdAt: data.createdAt || null
              };
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
            setLoading(true);
          } finally {
            setLoading(false);
          }
        };
        fetchContracts();
      },[]);

  if (loading) {
    return <div>Cargando contratos...</div>;
  }

  return (
    <div>
      <DataTable value={contracts} paginator rows={10} loading={loading}>
        {columns.map((col) => (
          <Column key={col.field} field={col.field} header={col.header} sortable />
        ))}
      </DataTable>  
    </div>
  )
}

export default PdfList;
