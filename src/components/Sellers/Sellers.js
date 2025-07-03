import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { getUserContracts, deleteContract, formatDate } from '../Shared/FirebaseContrats';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import SignatureCanvas from 'react-signature-canvas';
import { showSuccess } from '../Administrator/FirebaseSellers';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const Sellers = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const signatureRef = useRef(null);
  const [showFirmaDialog, setShowFirmaDialog] = useState(false)
  const [firmaClienteTarget, setFirmaClienteTarget] = useState(null);
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
  
  
  const firmaTemplate = (rowData) => {
  return rowData.firmaCliente ? (
    <p>Firmado</p>
  ) : (
    <Button
      icon="pi pi-pencil"
      severity="success"
      rounded
      outlined
      tooltip="Firmar contrato"
      onClick={() => {
        setFirmaClienteTarget(rowData); 
        setShowFirmaDialog(true);
      }}
    />
  );
};


  const handleSaveSignature = async () => {
    if (signatureRef.current.isEmpty()) {
      showError('Por favor, proporcione una firma');
      return;
    }
    const signatureData = signatureRef.current.toDataURL();
    try {
      const docRef = doc(db, "contracts", firmaClienteTarget.id);
      await updateDoc(docRef, { firmaCliente: signatureData, status:"activo"});
      setContracts((prev) =>
        prev.map((c) =>
          c.id === firmaClienteTarget.id ? { ...c, firmaCliente: signatureData } : c
        )
      );
      setShowFirmaDialog(false);
      showSuccess("Firma guardada correctamente");
    } catch (error) {
      console.error("Error guardando firma:", error);
      showError("Error al guardar la firma");
    }
  };

  const handleClearSignature = () => {
    signatureRef.current.clear();
  };

  const accionesBodyTemplate = (rowData) => (
  <div className="acciones-contrato" id='sellers'>
    <Button
      icon="pi pi-pencil"
      className="btn-accion btn-ver"
      tooltip="Firmar contrato"
      onClick={() => {
        setFirmaClienteTarget(rowData);
        setShowFirmaDialog(true);
      }}
      disabled={!!rowData.firmaCliente}
    />
    <Button
      icon="pi pi-trash"
      className="btn-accion btn-pdf"
      tooltip="Eliminar contrato"
      onClick={() => handleDelete(rowData.id)}
    />
  </div>
);

  const columns = [
    { field: 'titulo', header: 'Título' },
    { field: 'contenido', header: 'Contenido' },
    { field: 'createdAt', header: 'Fecha Creación' },
    { field: 'status', header: 'Estado', body: statusBodyTemplate },
    { header: 'Acciones', body: accionesBodyTemplate }

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

    fetchContracts();
    
  }, []);

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center min-h-screen bg-blue-50">
        <ProgressSpinner style={{ width: '60px', height: '60px' }} strokeWidth="4" />
      </div>
    );
  }

  return (
    <div className="surface-ground p-6 shadow-4 border-round-lg animate__animated animate__fadeIn" id='sellers'>
      <Toast ref={toast} />
      <div className="flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl font-medium text-700">Mis Contratos</h2>
      </div>
    
      <DataTable
        value={contracts}
        dataKey="id"
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25]}
        className="w-full animate__animated animate__fadeInUp"
        emptyMessage="No se encontraron contratos"
        rowClassName={(rowData) => {
          const index = contracts.findIndex(c => c.id === rowData.id);
          return index % 2 === 0 ? 'fila-par' : 'fila-impar';
        }}
      >

       {columns.map((col) => (
  <Column
    key={col.field || col.header}
    field={col.field}
    header={col.header}
    sortable
    body={col.body}
    headerClassName={col.header === 'Acciones' ? 'col-acciones font-medium' : 'font-medium'}
    bodyClassName={col.header === 'Acciones' ? 'col-acciones' : ''}
  />
))}

      </DataTable>

      {/*Firma del cliente*/}
            <Dialog
              header="Firma Digital"
              visible={showFirmaDialog}
              style={{ width: '80vw' }}
              onHide={() => setShowFirmaDialog(false)}
            >
              <div className="signature-container">
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    width: 500,
                    height: 200,
                    className: 'signature-canvas'
                  }}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                  <Button
                    label="Limpiar"
                    icon="pi pi-trash"
                    onClick={handleClearSignature}
                    className="p-button-danger botonEliminar"
                  />
                  <Button
                    label="Guardar Firma"
                    icon="pi pi-check"
                    onClick={handleSaveSignature}
                    className="p-button-success"
                  />
                </div>
              </div>
            </Dialog>
    </div>
  );
};

export default Sellers;
