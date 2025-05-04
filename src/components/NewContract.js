import React, { useEffect, useState, useRef } from 'react';
import { InputText, Button, Toast, Editor, Dialog } from 'primereact';
import { useNavigate, useLocation } from 'react-router-dom';
import { createContract } from './FirebaseContrats';
import { Document, Page, Text, Image, StyleSheet, pdf } from '@react-pdf/renderer';
import SignatureCanvas from 'react-signature-canvas';

const NewContract = () => {
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    firma: ''
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const toast = useRef(null);
  const signatureRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state?.user || null;

  useEffect(() => {
    setUser(userData);
  }, [userData]);

  const showError = (message) => {
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000
    });
  };

  const showSuccess = (message) => {
    toast.current?.show({
      severity: 'success',
      summary: 'Éxito',
      detail: message,
      life: 5000
    });
  };

  const handleSaveSignature = () => {
    if (signatureRef.current.isEmpty()) {
      showError('Por favor, proporcione una firma');
      return;
    }
    const signatureData = signatureRef.current.toDataURL();
    setFormData({...formData, firma: signatureData});
    setShowSignatureDialog(false);
    showSuccess('Firma guardada correctamente');
  };

  const handleClearSignature = () => {
    signatureRef.current.clear();
  };

  const generatePDF = async () => {
    const styles = StyleSheet.create({
      page: { padding: 30, fontFamily: 'Helvetica' },
      title: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
      content: { marginBottom: 30 },
      signature: { width: 200, height: 80, marginTop: 30 }
    });

    const MyDocument = () => (
      <Document>
        <Page style={styles.page}>
          <Text style={styles.title}>{formData.titulo}</Text>
          <Text style={styles.content}>{formData.contenido.replace(/<[^>]*>/g, '')}</Text>
          {formData.firma && (
            <>
              <Text>Firma del cliente:</Text>
              <Image src={formData.firma} style={styles.signature} />
            </>
          )}
        </Page>
      </Document>
    );

    const blob = await pdf(<MyDocument />).toBlob();
    return URL.createObjectURL(blob);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      showError("Debes iniciar sesión para crear contratos");
      return;
    }

    if (!formData.firma) {
      showError("Por favor, agregue una firma al contrato");
      return;
    }

    setLoading(true);
    try {
      const contractId = await createContract({
        ...formData,
        pdfUrl: await generatePDF() // Guardamos la URL generada
      });
      showSuccess(`Contrato creado con ID: ${contractId}`);
      navigate('/vendedor');
    } catch (error) {
      showError(`Error al crear contrato: ${error.message}`);
      console.error("Detalles del error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      <h2>Nuevo Contrato</h2>
      <form onSubmit={handleSubmit}>
        <div className="p-fluid grid">
          <div className="field col-12">
            <label htmlFor="titulo">Título del Contrato *</label>
            <InputText
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              required
            />
          </div>
          
          <div className="field col-12">
            <label htmlFor="contenido">Contenido *</label>
            <Editor
              id="contenido"
              value={formData.contenido}
              onTextChange={(e) => setFormData({...formData, contenido: e.htmlValue})}
              style={{ height: '300px' }}
              required
            />
          </div>
          
          <div className="field col-12">
            <label>Firma Digital</label>
            <div className="flex align-items-center gap-2">
              {formData.firma ? (
                <img 
                  src={formData.firma || 'Sin firma'} 
                  alt="Firma" 
                  style={{ width: '150px', height: '80px', border: '1px solid #ccc' }} 
                />
              ) : (
                <span>No hay firma guardada</span>
              )}
              <Button
                label={formData.firma ? "Cambiar Firma" : "Agregar Firma"}
                icon="pi pi-pencil"
                onClick={() => setShowSignatureDialog(true)}
                type="button"
                style={{ width: '150px', height: '50px', border: '1px solid #ccc' }}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-content-end gap-2 mt-4">
          <Button 
            label="Cancelar" 
            className="p-button-secondary" 
            onClick={() => navigate('/vendedor')}
            disabled={loading}
          />
          <Button 
            label={loading ? 'Guardando...' : 'Guardar Contrato'} 
            type="submit" 
            icon="pi pi-save"
            loading={loading}
          />
        </div>
      </form>

      {/* Diálogo para firma digital */}
      <Dialog
        header="Firma Digital"
        visible={showSignatureDialog}
        style={{ width: '80vw' }}
        onHide={() => setShowSignatureDialog(false)}
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
              className="p-button-danger"
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

export default NewContract;