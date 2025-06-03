import  { useEffect, useState, useRef } from 'react';
import { InputText, Button, Toast, Editor, Dialog } from 'primereact';
import { Calendar } from 'primereact/calendar';
import { InputMask } from 'primereact/inputmask';
import { InputNumber } from 'primereact/inputnumber';
import { Fieldset } from 'primereact/fieldset';
import { Checkbox } from 'primereact/checkbox';
import { Divider } from 'primereact/divider';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown'
import { useNavigate,useLocation } from 'react-router-dom';
import { auth } from '../../firebase';
import { createContract } from './FirebaseContrats';
import SignatureCanvas from 'react-signature-canvas';
import { showError, showSuccess} from "../Administrator/FirebaseSellers";

const NewContract = () => {
  const [formData, setFormData] = useState({
    titulo: 'Contrato de Servicios',
    nombre: '',
    apellido: '',
    dni: '',
    fechaInicio: '',
    fechaFin: '',
    contenido: '',
    monto: 0,
    incluyePenalizacion: false,
    firma: '',
    aceptaTerminos: false,
    provincia:'',
    localidad:'',
    codPostal:'',
    email:'',
    //servicioAdicional:'',
    //equipos:''
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [selectedPro, setSelectedPro] = useState(null);
  const toast = useRef(null);
  const signatureRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation(); 

  const provincias = ["Buenos Aires","Santa Fé","Santiago del Estero",
    "Córdoba","Catamarca","La Rioja","Río Negro","San Luis","San Juan",
    "Mendoza","Neuquén","Santa Cruz","Chubut","Chaco","Misiones","Corrientes",
    "Salta","Jujuy","Tierra del Fuego","Tucumán","Formosa","Entre Ríos","La Pampa"]

  useEffect(() => {
    if (location.state?.user) {
      setUser(location.state.user);
    } 
    else {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);
      }
    }
  }, [location.state]);

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

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'incluyePenalizacion' || name === 'aceptaTerminos' ? checked : value
    }));
  };

  const handleClearSignature = () => {
    signatureRef.current.clear();
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
      });
      showSuccess(`Contrato creado con ID: ${contractId}`);
      navigate('/sellers');
    } catch (error) {
      showError(`Error al crear contrato: ${error.message}`);
      console.error("Detalles del error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <Card title="Generador de Contratos" className="shadow-2">
        <form onSubmit={handleSubmit}>
          {/* Sección de Título */}
          <div className="field mb-4">
            <label htmlFor="titulo" className="block font-bold mb-2">Título del Contrato: </label>
            <InputText
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              className="w-full"
              required
            />
          </div>

          {/* Sección de Partes Contratantes */}
          <Fieldset legend="Partes Contratantes" className="mb-4">
            <div className="grid">
              <div className="col-12 md:col-4">
                <label htmlFor="nombre" className="block mb-2">Nombre: </label>
                <InputText
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full"
                  required
                />
              </div>
              <div className="col-12 md:col-4">
                <label htmlFor="apellido" className="block mb-2">Apellido: </label>
                <InputText
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className="w-full"
                  required
                />
              </div>
              <div className="col-12 md:col-4">
                <label htmlFor="dni" className="block mb-2">DNI: </label>
                <InputMask
                  id="dni"
                  name="dni"
                  value={formData.dni}
                  onChange={handleInputChange}
                  mask="99999999"
                  placeholder="12345678"
                  className="w-full"
                  required
                />
              </div>
            </div>
          </Fieldset>

          <Divider />

          {/* Sección de Fechas */}
          <Fieldset legend="Datos del Contrato" className="mb-4">
            <div className="grid">
              <div className="col-12 md:col-6">
                <label htmlFor="fechaInicio" className="block mb-2">Fecha de Inicio: </label>
                <Calendar
                  id="fechaInicio"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleInputChange}
                  dateFormat="dd/mm/yy"
                  className="w-full"
                  showIcon
                  required
                />
              </div>
              <div className="col-12 md:col-6">
                <label htmlFor="fechaFin" className="block mb-2">Fecha de Fin: </label>
                <Calendar
                  id="fechaFin"
                  name="fechaFin"
                  value={formData.fechaFin}
                  onChange={handleInputChange}
                  dateFormat="dd/mm/yy"
                  className="w-full"
                  showIcon
                  required
                />
              </div>
            </div>
          </Fieldset>

          <Divider />

          {/* Sección de Cláusulas */}
          <Fieldset legend="Cláusulas" className="mb-4">
            <div className="field">
              <label htmlFor="monto" className="block mb-2">Monto Mensual (USD): </label>
              <InputNumber
                id="monto"
                name="monto"
                value={formData.monto}
                onValueChange={(e) => setFormData({...formData, monto: e.value})}
                mode="currency"
                currency="USD"
                locale="en-US"
                className="w-full"
                required
              />
            </div>
            
            <div className="field-checkbox mt-3">
              <Checkbox
                inputId="incluyePenalizacion"
                name="incluyePenalizacion"
                checked={formData.incluyePenalizacion}
                onChange={handleInputChange}
              />
              <label htmlFor="incluyePenalizacion" className="ml-2">Incluir penalización por mora: </label>
            </div>
            
            <div className="field mt-4">
              <label htmlFor="contenido" className="block mb-2">Contenido Adicional: </label>
              <Editor
                id="contenido"
                name="contenido"
                value={formData.contenido}
                onTextChange={(e) => setFormData({...formData, contenido: e.htmlValue})}
                style={{ height: '200px' }}
                required
              />
            </div>
          </Fieldset>

          <Divider />
          {/*Sección de datos de ubicación*/}
          <Fieldset legend="Ubicación" className='mb.4'>
            <div className='grid'>
              <div className="col-12 md:col-6">
                <label>Provincia *</label>
                <Dropdown 
                  value={selectedPro} 
                  options={provincias} 
                  onChange={(e)=>setSelectedPro(e.value)}
                  placeholder='Seleccioná una provincia'
                />
              </div>
              <div className="col-12 md:col-6">
                <label htmlFor="localidad" className="block mb-2">Localidad: </label>
                  <InputText
                    id="localidad"
                    name="localidad"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full"
                    required
                  />
              </div>
              <div className="col-12 md:col-6">
                <label htmlFor='altura' className='block mb-2'>Altura: </label>
                <InputNumber
                  id="monto"
                  name="monto"
                  value={formData.monto}
                  onValueChange={(e) => setFormData({...formData, monto: e.value})}
                  className="w-full"
                  required
                />
              </div>
              <div className="col-12 md:col-6">
                <label htmlFor="codPostal" className="block mb-2">Código Postal: </label>
                  <InputText
                    id="codigo postal"
                    name="codigo postal"
                    value={formData.codPostal}
                    onChange={handleInputChange}
                    className="w-full"
                    required
                  />
              </div>
              <div className="col-12 md:col-6">
                <label htmlFor="email" className="block mb-2">Email del Contratante: </label>
                  <InputText
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full"
                    required
                  />
              </div>
            </div>
          </Fieldset>
          

          <Divider />

          {/* Sección de Términos y Firmas */}
          <Fieldset legend="Términos y Firmas" className="mb-4">
            <div className="field-checkbox mb-4">
              <Checkbox
                inputId="aceptaTerminos"
                name="aceptaTerminos"
                checked={formData.aceptaTerminos}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="aceptaTerminos" className="ml-2">Ambas partes aceptan los términos y condiciones: </label>
            </div>
            
            <div className="flex flex-column md:flex-row justify-content-between gap-4">
              <div className="flex flex-column align-items-center">
                <label className="block mb-2">Firma del Cliente: </label>
                {formData.firma ? (
                  <img 
                    src={formData.firma} 
                    alt="Firma" 
                    style={{ width: '200px', height: '80px', border: '1px solid #ccc' }} 
                  />
                ) : (
                  <div style={{ width: '200px', height: '80px', border: '1px dashed #ccc' }} className="flex align-items-center justify-content-center">
                    <span>Sin firma</span>
                  </div>
                )}
                <Button
                  label={formData.firma ? "Cambiar Firma" : "Agregar Firma"}
                  icon="pi pi-pencil"
                  onClick={() => setShowSignatureDialog(true)}
                  type="button"
                  className="mt-2"
                />
              </div>
              
              <div className="flex flex-column align-items-center">
                <label className="block mb-2">Firma del Representante</label>
                <div style={{ width: '200px', height: '80px', borderBottom: '1px solid #000' }}></div>
                <small className="mt-1 text-500">Nombre: {user?.displayName || 'Representante'}</small>
              </div>
            </div>
          </Fieldset>

          {/* Botones de Acción */}
          <div className="flex justify-content-end gap-2 mt-4">
            <Button 
              label="Cancelar" 
              className="p-button-secondary" 
              onClick={() => navigate('/sellers')}
              disabled={loading}
            />
            <Button 
              label={loading ? 'Guardando...' : 'Guardar Contrato'} 
              type="submit" 
              icon="pi pi-save"
              loading={loading}
              disabled={!formData.aceptaTerminos || !formData.firma}
            />
          </div>
        </form>
      </Card>

      {/* Diálogo para firma digital*/}
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

