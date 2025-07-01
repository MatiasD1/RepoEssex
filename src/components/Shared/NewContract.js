// NewContract.jsx (Simplificado)
import { useEffect, useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { InputMask } from 'primereact/inputmask';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { Editor } from 'primereact/editor';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import SignatureCanvas from 'react-signature-canvas';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../firebase';
import { createContract } from './FirebaseContrats';
import { showError, showSuccess } from '../Administrator/FirebaseSellers';

const NewContract = () => {
  const [formData, setFormData] = useState({
    titulo: '', nombre: '', apellido: '', dni: '',
    fechaInicio: '', fechaFin: '', contenido: '', monto: 0,
    incluyePenalizacion: false, firma: '', aceptaTerminos: false,
    provincia: '', localidad: '', codPostal: '', altura: '', email: ''
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [selectedPro, setSelectedPro] = useState(null);
  const toast = useRef(null);
  const signatureRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const provincias = ["Buenos Aires", "Santa Fé", "Córdoba", "Mendoza", "Salta"];

  useEffect(() => {
    const currentUser = location.state?.user || auth.currentUser;
    if (currentUser) setUser(currentUser);
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: name.includes('Penalizacion') || name.includes('Terminos') ? checked : value }));
  };

  const handleSaveSignature = () => {
    if (signatureRef.current.isEmpty()) return showError('Proporcione una firma');
    setFormData({ ...formData, firma: signatureRef.current.toDataURL() });
    setShowSignatureDialog(false);
    showSuccess('Firma guardada');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return showError("Debes iniciar sesión");
    if (!formData.firma) return showError("Agregue una firma");

    setLoading(true);
    try {
      const id = await createContract({ ...formData });
      showSuccess(`Contrato creado (ID: ${id})`);
      navigate('/sellers');
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <Toast ref={toast} />
      <h2>Generador de Contratos</h2>
      <Card>
        <form onSubmit={handleSubmit} className="contract-form formNewContract">
          <div className="primeraParteContrato">
            <InputText name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Título del Contrato" required />
            <InputNumber name="monto" value={formData.monto} onValueChange={(e) => setFormData({ ...formData, monto: e.value })} mode="currency" currency="USD" placeholder="Monto Mensual" required />

            <InputText name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" required />
            <InputText name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Apellido" required />

            <InputMask name="dni" value={formData.dni} onChange={handleChange} mask="99999999" placeholder="DNI" required />
            <InputText name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />

            <Calendar name="fechaInicio" value={formData.fechaInicio} onChange={handleChange} placeholder="Fecha de Inicio" showIcon required />
            <Calendar name="fechaFin" value={formData.fechaFin} onChange={handleChange} placeholder="Fecha de Fin" showIcon required />
          </div>

          <div className='checkboxPenalizacion'>
            <div className="campoCheckbox">
              <span>Incluir penalización</span>
              <Checkbox name="incluyePenalizacion" checked={formData.incluyePenalizacion} onChange={handleChange} />
            </div>          
          </div>
          <Editor value={formData.contenido} onTextChange={(e) => setFormData({ ...formData, contenido: e.htmlValue })} style={{ height: '200px' }} />
          <Dropdown value={selectedPro} options={provincias} onChange={(e) => setSelectedPro(e.value)} placeholder="Provincia" required />
          <InputText name="localidad" value={formData.localidad} onChange={handleChange} placeholder="Localidad" required />
          <InputText name="codPostal" value={formData.codPostal} onChange={handleChange} placeholder="Código Postal" required />
          <InputNumber name="altura" value={formData.altura} onValueChange={(e) => setFormData({ ...formData, altura: e.value })} placeholder="Altura" required />
          <InputText name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />

          <div className="campoCheckbox">
            <span>Acepto los términos</span>
            <Checkbox name="aceptaTerminos" checked={formData.aceptaTerminos} onChange={handleChange} required />
          </div>

          <div className="firma-box">
            <label>Firma del Vendedor:</label>
            {formData.firma ? (
              <img src={formData.firma} alt="Firma" className="firma-imagen" />
            ) : (
              <div className="firma-imagen">Sin firma</div>
            )}
            <Button label="Firmar" icon="pi pi-pencil" onClick={() => setShowSignatureDialog(true)} type="button" className="mt-2" />
          </div>

          <div className="botones">
            <Button label="Cancelar" className="p-button-secondary" onClick={() => navigate('/sellers')} disabled={loading} />
            <Button label={loading ? 'Guardando...' : 'Guardar Contrato'} type="submit" loading={loading} disabled={!formData.aceptaTerminos || !formData.firma} />
          </div>
        </form>
      </Card>

      <Dialog header="Firma Digital" visible={showSignatureDialog} style={{ width: '80vw' }} onHide={() => setShowSignatureDialog(false)}>
        <SignatureCanvas
          ref={signatureRef}
          canvasProps={{ width: 500, height: 200, className: 'signature-canvas' }}
        />
        <div className="firma-acciones">
          <Button label="Limpiar" icon="pi pi-trash" onClick={() => signatureRef.current.clear()} className="p-button-danger" />
          <Button label="Guardar Firma" icon="pi pi-check" onClick={handleSaveSignature} className="p-button-success" />
        </div>
      </Dialog>
    </div>
  );
};

export default NewContract;