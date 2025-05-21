import  { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { getUserContracts, formatDate } from './FirebaseContrats'; // Asegúrate de tener esta función
import ContractDetail from './ContractDetail'; // Componente que crearemos después
import { Document, Page, Text, Image, StyleSheet, pdf, View } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

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

  const showError = (message) => {
    toast.current.show({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000
    });
  };

  const generatePDF = async (contract) => {
    try {
      const styles = StyleSheet.create({
        page: { 
          padding: 40,
          fontFamily: 'Times-Roman',
          fontSize: 12,
          lineHeight: 1.5
        },
        title: { 
          fontSize: 16,
          fontWeight: 'bold',
          marginBottom: 20,
          textAlign: 'center',
          textDecoration: 'underline'
        },
        sectionTitle: {
          fontSize: 14,
          fontWeight: 'bold',
          marginTop: 15,
          marginBottom: 10
        },
        signatureSection: {
          marginTop: 40,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between'
        },
        signatureLine: {
          width: 200,
          borderBottom: '1px solid black',
          marginBottom: 5
        }
      });
    
      const MyDocument = () => (
        <Document>
          <Page style={styles.page}>
            <Text style={styles.title}>{contract.titulo}</Text>
            
            <Text style={styles.sectionTitle}>PARTES CONTRATANTES:</Text>
            <Text>
              {`Entre ${contract.nombre} ${contract.apellido}, identificado con DNI ${contract.dni}, `}
              {`y [NOMBRE_EMPRESA], celebran el presente contrato con fecha ${formatDate(contract.fechaInicio)}.`}
            </Text>
    
            <Text style={styles.sectionTitle}>DATOS DEL CONTRATO:</Text>
            <Text>
              {`- Fecha de inicio: ${formatDate(contract.fechaInicio)}`}
              {'\n'}
              {`- Fecha de fin: ${formatDate(contract.fechaFin)}`}
              {'\n'}
              {`- Monto mensual: $${contract.monto} USD`}
              {'\n'}
              {contract.incluyePenalizacion && '- Incluye penalización por mora'}
            </Text>
    
            <Text style={styles.sectionTitle}>CLÁUSULAS:</Text>
            <Text>
              {contract.contenido.replace(/<[^>]*>/g, '')}
            </Text>
    
            <Text style={styles.sectionTitle}>TÉRMINOS Y CONDICIONES:</Text>
            <Text>
              Ambas partes aceptan los términos y condiciones establecidos en este contrato.
            </Text>
    
            <View style={styles.signatureSection}>
              <View>
                <Text>Firma del Cliente:</Text>
                {contract.firma && (
                  <Image 
                    src={contract.firma} 
                    style={{ width: 150, height: 60, marginTop: 10 }} 
                  />
                )}
                <Text style={{ marginTop: 20 }}>
                  {`${contract.nombre} ${contract.apellido}`}
                  {'\n'}
                  DNI: {contract.dni}
                </Text>
              </View>
    
              <View>
                <Text>Firma del Representante:</Text>
                <View style={styles.signatureLine}></View>
                <Text style={{ marginTop: 20 }}>
                  {contract.userName || '[Nombre Representante]'}
                  {'\n'}
                  [Cargo]
                </Text>
              </View>
            </View>
          </Page>
        </Document>
      );
    
      const blob = await pdf(<MyDocument />).toBlob();
      return blob;
    } catch (error) {
      throw error;
    }
  };

  const handleDownloadPDF = async (contract) => {
    try {
      const blob = await generatePDF(contract);
      saveAs(blob, `contrato_${contract.nombre}_${contract.apellido}.pdf`);
    } catch (error) {
      showError(`Error al generar PDF: ${error.message}`);
    }
  };

  const handlePreviewPDF = async (contract) => {
    try {
      const blob = await generatePDF(contract);
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
      <div className="flex gap-2">
        <Button 
          icon="pi pi-eye" 
          className="p-button-rounded p-button-info"
          onClick={() => {
            setSelectedContract(rowData);
            setShowDetailDialog(true);
          }}
        />
        <Button 
          icon="pi pi-download" 
          className="p-button-rounded p-button-success"
          onClick={() => handleDownloadPDF(rowData)}
        />
        <Button 
          icon="pi pi-file-pdf" 
          className="p-button-rounded p-button-help"
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
        }}
      >
        {pdfUrl && (
          <iframe 
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