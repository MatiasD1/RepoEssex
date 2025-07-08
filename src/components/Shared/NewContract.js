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
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import SignatureCanvas from 'react-signature-canvas';
import { useNavigate, useLocation } from 'react-router-dom';
import { createContract } from './FirebaseContrats';
import { showError, showSuccess } from '../Administrator/FirebaseSellers';
import { useSearchParams } from 'react-router-dom';


const NewContract = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [selectedPro, setSelectedPro] = useState(null);

  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'empresa';
  const contractId = searchParams.get('id');
  const esEmpresa = mode === 'empresa';


  const toast = useRef(null);
  const signatureRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const provincias = ["Buenos Aires", "Santa Fé", "Córdoba", "Mendoza", "Salta"];

  /*Carga datos de la empresa*/
  useEffect(() => {
    const stateUser = location.state?.user;
    setUser(stateUser);
    setLoading(false);
  }, [location.state]);


  const [formData, setFormData] = useState({
    titulo: '', nombre: '', apellido: '', dni: '',
    fechaInicio: '', fechaFin: '', contenido: '', monto: 0,
    incluyePenalizacion: false, firma: '', aceptaTerminos: false,
    provincia: '', localidad: '', codPostal: '', altura: '', email: '',telefono:'',
    emailEmpresa:user.email, nombreEmpresa:user.name, firmaVendedor: '', firmaUsuario: ''
  });
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: name.includes('Penalizacion') || name.includes('Terminos') ? checked : value }));
  };

  const handleSaveSignature = () => {
    if (signatureRef.current.isEmpty()) return showError('Proporcione una firma');

    if (esEmpresa) {
      setFormData(prev => ({ ...prev, firmaVendedor: signatureRef.current.toDataURL() }));
    } else {
      setFormData(prev => ({ ...prev, firmaUsuario: signatureRef.current.toDataURL() }));
    }

    setShowSignatureDialog(false);
    showSuccess('Firma guardada');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (esEmpresa) {
        await createContract(formData);
      } else {
        const ref = doc(db, "contracts", contractId);
        await updateDoc(ref, {
          firmaUsuario: formData.firmaUsuario,
          aceptaTerminos: formData.aceptaTerminos,
          nombre: formData.nombre,
          apellido: formData.apellido,
          dni: formData.dni,
          email: formData.email,
          telefono: formData.telefono,
          provincia: formData.provincia,
          localidad: formData.localidad,
          codPostal: formData.codPostal,
          altura: formData.altura,
          status:'pendiente'
        });
      }
      showSuccess("Contrato guardado exitosamente");
      navigate(esEmpresa ? '/sellers' : '/');
    } catch (error) {
      console.error("Error al guardar el contrato:", error);
    }
  };


  /*Cargar el contrato si el que ingresa es un usuario a completar su parte*/
  useEffect(() => {
  if (contractId && !esEmpresa) {
    const cargarContrato = async () => {
      try {
        const docRef = doc(db, "contracts", contractId);
        const contratoSnap = await getDoc(docRef);
        if (contratoSnap.exists()) {
          setFormData(contratoSnap.data());
        } else {
          showError("Contrato no encontrado");
        }
      } catch (e) {
        showError("Error al cargar contrato");
      }
    };
    cargarContrato();
  }
}, [contractId,esEmpresa]);


 return (
    <div className="form-container">
      <Toast ref={toast} />
      <h2>{esEmpresa ? 'Generador de Contratos' : 'Revisión y Firma del Contrato'}</h2>
      <Card>
        <form onSubmit={handleSubmit} className="contract-form formNewContract">
          <div className="primeraParteContrato">
            {esEmpresa && (
              <>
                <InputText name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Título del Contrato" required />
                <InputNumber name="monto" value={formData.monto} onValueChange={(e) => setFormData({ ...formData, monto: e.value })} mode="currency" currency="USD" placeholder="Monto Mensual" required />
                <Calendar name="fechaInicio" value={formData.fechaInicio} onChange={handleChange} placeholder="Fecha de Inicio" showIcon required />
                <Calendar name="fechaFin" value={formData.fechaFin} onChange={handleChange} placeholder="Fecha de Fin" showIcon required />
                 <InputText name="email" value={formData.email} onChange={handleChange} placeholder="Email del Cliente" />
              </>
            )}

            {/* Datos de Usuario - siempre editables por el usuario */}
            <InputText name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" disabled={esEmpresa} />
            <InputText name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Apellido" disabled={esEmpresa} />
            <InputMask name="dni" value={formData.dni} onChange={handleChange} mask="99999999" placeholder="DNI" disabled={esEmpresa} />
            <InputMask name="telefono" value={formData.telefono} onChange={handleChange} mask="+54 9 9999-9999" placeholder="Teléfono" disabled={esEmpresa} />
          </div>

          {esEmpresa && (
            <>
              <div className='checkboxPenalizacion'>
                <div className="campoCheckbox">
                  <span>Incluir penalización</span>
                  <Checkbox name="incluyePenalizacion" checked={formData.incluyePenalizacion} onChange={handleChange} />
                </div>
              </div>

              <Editor
                value={formData.contenido}
                onTextChange={(e) => setFormData({ ...formData, contenido: e.htmlValue.replace(/<[^>]+>/g, '') })}
                className="editor-contrato"
                style={{ height: '200px' }}
              />
            </>
          )}

          {/* Zona del usuario */}
          <Dropdown
            value={selectedPro || formData.provincia}
            options={provincias}
            onChange={(e) => {
              setSelectedPro(e.value);
              setFormData({ ...formData, provincia: e.value });
            }}
            placeholder="Provincia"
            disabled={esEmpresa}
          />
          <InputText name="localidad" value={formData.localidad} onChange={handleChange} placeholder="Localidad" disabled={esEmpresa} />
          <InputText name="codPostal" value={formData.codPostal} onChange={handleChange} placeholder="Código Postal" disabled={esEmpresa} />
          <InputNumber name="altura" value={formData.altura} onValueChange={(e) => setFormData({ ...formData, altura: e.value })} placeholder="Altura" disabled={esEmpresa} />

          <div className="campoCheckbox">
            <span>Acepto los términos</span>
            <Checkbox name="aceptaTerminos" checked={formData.aceptaTerminos} onChange={handleChange} />
          </div>

          {/* Firma de la empresa (solo visual si es usuario) */}
          {!esEmpresa && formData.firmaVendedor && (
            <div className="firma-box">
              <label>Firma de la Empresa:</label>
              <img src={formData.firmaVendedor} alt="Firma Empresa" className="firma-imagen" />
            </div>
          )}


          {/* Firma del usuario o empresa según modo */}
          <div className="firma-box">
            <label>{esEmpresa ? 'Firma de la Empresa:' : 'Firma del Usuario:'}</label>
            {(esEmpresa ? formData.firmaVendedor : formData.firmaUsuario) ? (
              <img
                src={esEmpresa ? formData.firmaVendedor : formData.firmaUsuario}
                alt="Firma"
                className="firma-imagen"
              />
            ) : (
              <div className="firma-imagen">Sin firma</div>
            )}
            <Button
              label="Firmar"
              icon="pi pi-pencil"
              onClick={() => setShowSignatureDialog(true)}
              type="button"
              className="mt-2 botonForm"
            />
          </div>

          <div className="botones">
            <Button label="Cancelar" className="p-button-secondary" onClick={() => navigate(esEmpresa ? '/sellers' : '/')} disabled={loading} />
            {esEmpresa ? (
              <Button label={loading ? 'Guardando...' : 'Guardar Contrato'} type="submit" loading={loading} disabled={!formData.aceptaTerminos || !formData.firmaVendedor} />
            ) : (
              <Button label="Aceptar y Firmar" icon="pi pi-check" onClick={handleSubmit} type="button" disabled={!formData.firmaUsuario} />
            )}
          </div>
        </form>
      </Card>

      <Dialog
        header="Firma Digital"
        visible={showSignatureDialog}
        style={{ width: '600px', borderRadius: '12px', padding: '1rem' }}
        className="firma-dialog"
        onHide={() => setShowSignatureDialog(false)}
        modal
      >
        <div className="firma-contenedor">
          <SignatureCanvas
            ref={signatureRef}
            penColor="#000"
            canvasProps={{ width: 500, height: 200, className: 'signature-canvas' }}
          />
          <div className="firma-acciones">
            <Button label="Limpiar" icon="pi pi-trash" onClick={() => signatureRef.current.clear()} className="p-button-outlined p-button-danger botonForm" />
            <Button label="Guardar Firma" icon="pi pi-check" onClick={handleSaveSignature} className="p-button-success botonForm" />
          </div>
        </div>
      </Dialog>
    </div>
  );
};


export default NewContract;