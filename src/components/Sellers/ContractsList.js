import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { getUserContracts, formatDate, generatePDF } from '../Shared/FirebaseContrats'; 
import ContractDetail from '../Shared/ContractDetail'; 
import { saveAs } from 'file-saver';
import { getUserById, showError } from '../Administrator/FirebaseSellers';

const ContractsList = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showPDFDialog, setShowPDFDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const toast = useRef(null);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const contractsData = await getUserContracts();
        setContracts(contractsData);
      } catch (error) {
        console.error("Error fetching contracts:", error);
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los contratos',
          life: 5000
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []); 

  const handleDownloadPDF = async (contract) => {
    try {
      const blob = await generatePDF(contract,formatDate);
      saveAs(blob, `contrato_${contract.nombre}_${contract.apellido}.pdf`);
    } catch (error) {
      showError(`Error al generar PDF: ${error.message}`);
    }
  };

  const handlePreviewPDF = async (contract) => {
    try {
      const user = await getUserById(contract.userUID);
      console.log(user);
      const blob = await generatePDF(contract,formatDate,user);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setSelectedContract(contract);
      setShowPDFDialog(true);
    } catch (error) {
      showError(`Error al generar vista previa: ${error.message}`);
    }
  };

  const actionBodyTemplate = (rowData) => {
  return (
    <div className="acciones-contrato">
      <Button
        icon="pi pi-eye"
        className="btn-accion btn-ver"
        onClick={() => {
          setSelectedContract(rowData);
          setShowDetailDialog(true);
        }}
      />
      <Button
        icon="pi pi-download"
        className="btn-accion btn-descargar"
        onClick={() => handleDownloadPDF(rowData)}
      />
      <Button
        icon="pi pi-file-pdf"
        className="btn-accion btn-pdf"
        onClick={() => handlePreviewPDF(rowData)}
      />
    </div>
  );
};


  const dateBodyTemplate = (rowData) => {
    return formatDate(rowData.fechaInicio);
  };

  const clientBodyTemplate = (rowData) => {
    return `${rowData.nombre} ${rowData.apellido}`;
  };

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <Card title="Listado de Contratos">
        <DataTable
          value={contracts}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} contratos"
          emptyMessage="No se encontraron contratos"
          scrollable
          rowClassName={(rowData) => {
            const index = contracts.findIndex(c => c.id === rowData.id);
            return index % 2 === 0 ? 'fila-par' : 'fila-impar';
          }}
        >
          <Column field="titulo" header="Título" sortable></Column>
          <Column header="Cliente" body={clientBodyTemplate} sortable></Column>
          <Column field="dni" header="DNI" sortable></Column>
          <Column header="Fecha Inicio" body={dateBodyTemplate} sortable></Column>
          <Column field="monto" header="Monto (USD)" sortable></Column>
          <Column body={actionBodyTemplate} header="Acciones"></Column>
        </DataTable>
      </Card>

      {/* Diálogo de detalle */}
      <Dialog
        header={`Detalle del Contrato: ${selectedContract?.titulo || ''}`}
        visible={showDetailDialog}
        style={{ width: '80vw' }}
        onHide={() => setShowDetailDialog(false)}
      >
        {selectedContract && (
          <ContractDetail contract={selectedContract} />
        )}
      </Dialog>

      {/* Diálogo de vista previa PDF */}
      <Dialog
        header={`Vista Previa PDF: ${selectedContract?.titulo || ''}`}
        visible={showPDFDialog}
        style={{ width: '90vw', height: '90vh' }}
        onHide={() => {
          setShowPDFDialog(false);
          if (pdfUrl) URL.revokeObjectURL(pdfUrl);
          setPdfUrl(null);
        }}
      >
        {pdfUrl && (
        <iframe
          key={pdfUrl} // 🔑 Fuerza re-render
          src={pdfUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Vista previa del contrato"
        />
        )}
      </Dialog>
    </div>
  );
};

export default ContractsList;