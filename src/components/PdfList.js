import React, { useEffect, useState,useRef } from 'react';
import { getUserContracts } from './FirebaseContrats';

const PdfList = () => {

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useRef(null);

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

  return (
    <div>
      
    </div>
  )
}

export default PdfList;
