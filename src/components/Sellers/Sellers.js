import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { getUserContracts, deleteContract, formatDate } from '../Shared/FirebaseContrats';
import { enviarFormulario, generarCodigo } from '../Shared/EmailCode';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { showSuccess, showError } from '../Administrator/FirebaseSellers';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const Sellers = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useRef(null);

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
    const severity = rowData.status === 'pendiente' ? 'warning' : rowData.status === 'activo' ? 'success' : 'danger';
    return <Tag value={rowData.status} severity={severity}/>;
  };

  const actionBodyTemplate = (rowData) => (
    <div>      
      <Button
        icon="pi pi-trash"
        severity="danger"
        rounded
        outlined
        tooltip="Eliminar contrato"
        onClick={() => handleDelete(rowData.id)}
      />
    </div>
  );
  
  
  const firmaTemplate = (rowData) => {
    if (rowData.firmaUsuario && rowData.firmaVendedor && rowData.status === "activo") {
      return (
        <Tag
          value="Firmado"
          severity="success"
          style={{ height: '2.5rem', display: 'flex', alignItems: 'center' }}
        />
      );
    }

    if (rowData.firmaUsuario && rowData.firmaVendedor && rowData.status === "pendiente") {
      return (
        <Button
          icon="pi pi-code"
          severity="secondary"
          rounded
          outlined
          tooltip="Enviar código"
          onClick={async () => {
            try {
              await generarCodigo(rowData.id);
              const contractDoc = await getDoc(doc(db, "contracts", rowData.id));
              if (!contractDoc.exists()) {
                showError("No se pudo obtener el contrato actualizado");
                return;
              }
              const updatedContract = contractDoc.data();
              setContracts(prev =>
                prev.map(c => (c.id === rowData.id ? { ...c, ...updatedContract } : c))
              );
              showSuccess("Código enviado correctamente");
            } catch (error) {
              showError(`Error al enviar el código: ${error.message}`);
            }
          }}
        />
      );
    }

  return (
    <Button
      icon="pi pi-file-edit"
      severity="secondary"
      rounded
      outlined
      tooltip="Enviar formulario"
      onClick={async () => {
        try {
          console.log("Enviando formulario para contrato:", rowData.id, rowData.email);
          await enviarFormulario(rowData.id, rowData.email);
        } catch (error) {
          showError(`Error al enviar el formulario: ${error.message}`);
        }
      }}
    />
  );
};


  const actionCombinedTemplate = (rowData) => (
  <div style={{ display: 'flex', gap: '0.5rem' }}>
    {actionBodyTemplate(rowData)}
    {firmaTemplate(rowData)}
  </div>
);

  const columns = [
    { field: 'titulo', header: 'Título' },
     {
    field: 'contenido',
    header: 'Contenido',
    body: (rowData) => (
      <div dangerouslySetInnerHTML={{ __html: rowData.contenido }} />
    )
  },
    { field: 'createdAt', header: 'Fecha Creación' },
    { field: 'status', header: 'Estado', body: statusBodyTemplate },
    { field: 'email', header: 'Email del Cliente' },
    { header: 'Acciones', body: actionCombinedTemplate }
  ];

  useEffect(() => {
    
    const fetchContracts = async () => {
      try {
        const contractsData = await getUserContracts();
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
          body={col.body}
          sortable={col.header !== 'Acciones'} // La columna acciones no es ordenable
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
