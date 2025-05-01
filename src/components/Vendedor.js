import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { getDocs, query, collection, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import NavBar from './Navbar';

const Vendedor = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const toast = useRef(null);
  const navigate = useNavigate();
  
  const columns = [
    { field: 'titulo', header: 'Título' },
    { field: 'contenido', header: 'Contenido' },
    { field: 'firma', header: 'Firma' },
    { 
      field: 'createdAt', 
      header: 'Fecha Creación',
      body: (rowData) => {
        if (rowData.createdAt?.toDate) {
          return rowData.createdAt.toDate().toLocaleDateString();
        } else if (rowData.createdAt?.seconds) {
          return new Date(rowData.createdAt.seconds * 1000).toLocaleDateString();
        }
        return 'Fecha no disponible';
      }
    },
    { field: 'status', header: 'Estado' },
    { field: 'userUID', header: 'Usuario' },

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
        setLoading(true);
        const q = query(
          collection(db, "contracts"),
          where("userUID", "==", userId)
        );
        
        const querySnapshot = await getDocs(q);
        
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
      <div className="flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
        <p className="mt-3">Cargando contratos...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <NavBar/>
      <Toast ref={toast} />
      <h1 className="text-center">Bienvenido {user?.email || 'Usuario'}</h1>
      
      <div className="flex justify-content-between align-items-center mb-4">
        <h2>Mis Contratos</h2>
        {user && (
          <Button 
            label="Nuevo Contrato" 
            icon="pi pi-plus" 
            onClick={() => navigate('/vendedor/new')}
            disabled={loading}
          />
        )}
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
                onClick={() => navigate('/vendedor/new')}
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

export default Vendedor;