import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ProgressSpinner } from 'primereact/progressspinner';
import { getUserContracts, deleteContract, formatDate } from '../Shared/FirebaseContrats';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

const Sellers = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const toast = useRef(null);

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

  const statusBodyTemplate = (rowData) => {
    const severity = rowData.status === 'activo' ? 'success' : 'warning';
    return <Tag value={rowData.status} severity={severity} />;
  };

  const actionBodyTemplate = (rowData) => (
    <Button
      icon="pi pi-trash"
      severity="danger"
      rounded
      outlined
      tooltip="Eliminar contrato"
      onClick={() => handleDelete(rowData.id)}
    />
  );

  const columns = [
    { field: 'titulo', header: 'Título' },
    { field: 'contenido', header: 'Contenido' },
    { field: 'createdAt', header: 'Fecha Creación' },
    { field: 'status', header: 'Estado', body: statusBodyTemplate },
    { header: 'Eliminar', body: actionBodyTemplate }
  ];

  useEffect(() => {
    const fetchContracts = async (userId) => {
      try {
        const contractsData = await getUserContracts(userId);
        if (!contractsData || contractsData.length === 0) {
          showError("No se encontraron contratos para este usuario");
          return;
        }
        contractsData.forEach(contract => {
          contract.createdAt = formatDate(contract.createdAt);
          contract.fechaInicio = formatDate(contract.fechaInicio);
          contract.fechaFin = formatDate(contract.fechaFin);
        });

        console.log("Contratos cargados:", contractsData);
        setContracts(contractsData);
      } catch (error) {
        console.error("Error detallado:", error);
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
      <div className="flex justify-content-center align-items-center min-h-screen bg-blue-50">
        <ProgressSpinner style={{ width: '60px', height: '60px' }} strokeWidth="4" />
      </div>
    );
  }

  return (
    <div className="surface-ground p-6 shadow-4 border-round-lg animate__animated animate__fadeIn">
      <Toast ref={toast} />

      <h1 className="text-3xl font-bold text-primary text-center mb-5 animate__animated animate__fadeInDown">
        Bienvenido {user?.email || 'Usuario'}
      </h1>

      <div className="flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl font-medium text-700">Mis Contratos</h2>
      </div>

      <DataTable
        value={contracts}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25]}
        className="w-full animate__animated animate__fadeInUp"
        emptyMessage="No se encontraron contratos"
        rowClassName={() => "hover:surface-hover"}
      >
        {columns.map((col) => (
          <Column
            key={col.field || col.header}
            field={col.field}
            header={col.header}
            sortable
            body={col.body}
            headerClassName="bg-gray-100 font-medium"
          />
        ))}
      </DataTable>
    </div>
  );
};

export default Sellers;
