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
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { createContract, getContractById } from './FirebaseContrats';
import { showError, showSuccess } from '../Administrator/FirebaseSellers';
import { signOut, getAuth } from 'firebase/auth';


const NewContract = () => {
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [selectedPro, setSelectedPro] = useState(null);
  const [CamposOpcionales, setCamposOpcionales] = useState({});


  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'empresa';
  const contractId = searchParams.get('id');
  const esEmpresa = mode === 'empresa';

  // Si viene para editar el contrato

  const toast = useRef(null);
  const signatureRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const provincias = ["Buenos Aires", "Santa Fé", "Córdoba", "Mendoza", "Salta"];

  /*Carga datos de la empresa*/
  useEffect(() => {
    const fetchData = async () => {
      const id = location.state?.id;
      if (!id) return; 
      console.log("Cargando contrato para edición:", id);
      const data = await getContractById(id);
      if (data) {
        const fechaInicio = data.fechaInicio ? data.fechaInicio.toDate() : null;
        const fechaFin = data.fechaFin ? data.fechaFin.toDate() : null;
        setFormData(prev => ({ ...prev, ...data, fechaInicio, fechaFin }));
      } else {
        showError("Contrato no encontrado");
      }
    };

    fetchData();
  }, [location.state]);



  const [formData, setFormData] = useState({
    titulo: '', nombre: '', apellido: '', dni: '',
    fechaInicio: '', fechaFin: '', contenido: '', monto: 0,
    incluyePenalizacion: false, aceptaTerminos: false,
    provincia: '', localidad: '', codPostal: '', direccion:'', altura: '', email: '',telefono:'',
    emailEmpresa:"", nombreEmpresa:"", firmaVendedor: "", firmaUsuario: ""
  });

  useEffect(() => {
    if (!esEmpresa) return;   
    const fetchUserData = async () => {
      const auth = getAuth();
      if (!auth.currentUser) return; 
      const id = auth.currentUser.uid;
      const docRef = doc(db, "contracts", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormData(prev => ({
          ...prev,
          emailEmpresa: docSnap.data().email || prev.emailEmpresa,
          nombreEmpresa: docSnap.data().name || prev.nombreEmpresa
        }));
      }
    };
    fetchUserData();
  }, [esEmpresa]);


  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: name.includes('Penalizacion') || name.includes('Terminos') ? checked : value }));
  };

  const handleSaveSignature = () => {
    if (signatureRef.current.isEmpty()) return showError('Proporcione una firma');
    setFormData(prev => ({ ...prev, firmaVendedor: signatureRef.current.toDataURL() }));
    setShowSignatureDialog(false);
    showSuccess('Firma guardada');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (esEmpresa) {
        if (location.state.id) {
            const ref = doc(db, "contracts", location.state.id);
            const finalData = {...formData,...CamposOpcionales};
            await updateDoc(ref, finalData);
        } else {
            const finalData = {...formData,...CamposOpcionales};
            await createContract(finalData);
        }
        navigate('/sellers');
      } else {
        const ref = doc(db, "contracts", contractId);
        await updateDoc(ref, {
          firmaUsuario: "",
          aceptaTerminos: formData.aceptaTerminos,
          nombre: formData.nombre,
          apellido: formData.apellido,
          dni: formData.dni,
          email: formData.email,
          telefono: formData.telefono,
          provincia: formData.provincia,
          localidad: formData.localidad,
          codPostal: formData.codPostal,
          direccion: formData.direccion,
          altura: formData.altura,
          status:'pendiente'
        });
      }
      showSuccess("Contrato guardado exitosamente");
      navigate('/');
    } catch (error) {
      console.error("Error al guardar el contrato:", error);
    }
  };


  /*Cargar el contrato si el que ingresa es un usuario a completar su parte*/
  useEffect(() => {
  if (!contractId || esEmpresa) return;

  const fetchForAnonymous = async () => {
    try {
      const auth = getAuth();
      // si estás logueado, deslogueá y esperá
      if (auth.currentUser) {
        await signOut(auth);
      }

      const docRef = doc(db, "contracts", contractId);
      const contratoSnap = await getDoc(docRef);

      if (contratoSnap.exists()) {
        setFormData(contratoSnap.data());
      } else {
        showError("Contrato no encontrado");
      }
    } catch (e) {
      console.error(e);
      showError("Error al cargar contrato");
    }
  };

  fetchForAnonymous();
}, [contractId, esEmpresa]);


const labelsOpcionales = {
  renovable: 'Renovable',
  periodoRenovacion: 'Periodo de Renovación',
  clausulaTerminacionAnticipada: 'Cláusula de Terminación Anticipada',
  garantia: 'Garantía',
  seguro: 'Seguro',
  contactoEmergencia: 'Contacto de Emergencia',
  clausulaConfidencialidad: 'Cláusula de Confidencialidad',
  penalidadRetrasoPago: 'Penalidad por Retraso en el Pago',
  modalidadPago: 'Modalidad de Pago',
  clausulaFuerzaMayor: 'Cláusula de Fuerza Mayor'
};

 

 return (
    <div className="form-container">
      <Toast ref={toast} />
      <h2>{esEmpresa ? 'Nuevo Contrato' : 'Revisión y Firma del Contrato'}</h2>
      <Card>
        <form onSubmit={handleSubmit} className="contract-form formNewContract">
          <div className="primeraParteContrato">
            {esEmpresa && (
              <>
                <InputText name="titulo" value={formData.titulo || ''} onChange={handleChange} placeholder="Título del Contrato" required />
                <InputNumber name="monto" value={formData.monto || 0} onValueChange={(e) => setFormData({ ...formData, monto: e.value })} mode="currency" currency="USD" placeholder="Monto Mensual" required />
                <Calendar name="fechaInicio" minDate={new Date()} maxDate={new Date()} value={formData.fechaInicio || null} onChange={handleChange} placeholder="Fecha de Inicio" showIcon required />
                <Calendar name="fechaFin" minDate={new Date()} value={formData.fechaFin || null} onChange={handleChange} placeholder="Fecha de Fin" showIcon required />
                <InputText name="email" value={formData.email || ''} onChange={handleChange} placeholder="Email del Cliente" required/>
              </>
            )}

            {/* Datos de Usuario - siempre editables por el usuario */}
            <InputText name="nombre" value={formData.nombre || ''} onChange={handleChange} placeholder="Nombre" disabled={esEmpresa} hidden={esEmpresa} required/>
            <InputText name="apellido" value={formData.apellido || ''} onChange={handleChange} placeholder="Apellido" disabled={esEmpresa} hidden={esEmpresa} required/>
            <InputMask name="dni" value={formData.dni || ''} onChange={handleChange} mask="99999999" placeholder="DNI" disabled={esEmpresa} hidden={esEmpresa} required/>
            <InputMask name="telefono" value={formData.telefono || ''} onChange={handleChange} mask="+54 9 999 999-9999" placeholder="Teléfono" disabled={esEmpresa} hidden={esEmpresa} required/>
            {/* Dropdown para seleccionar campos opcionales */}
            <Dropdown
              options={[
                { label: 'Renovable', value: 'renovable' },
                { label: 'Periodo de Renovación', value: 'periodoRenovacion' },
                { label: 'Cláusula de Terminación Anticipada', value: 'clausulaTerminacionAnticipada' },
                { label: 'Garantía', value: 'garantia' },
                { label: 'Seguro', value: 'seguro' },
                { label: 'Contacto de Emergencia', value: 'contactoEmergencia' },
                { label: 'Cláusula de Confidencialidad', value: 'clausulaConfidencialidad' },
                { label: 'Penalidad por Retraso en el Pago', value: 'penalidadRetrasoPago' },
                { label: 'Modalidad de Pago', value: 'modalidadPago' },
                { label: 'Cláusula de Fuerza Mayor', value: 'clausulaFuerzaMayor' }
              ].filter(op => !CamposOpcionales.hasOwnProperty(op.value))}
              onChange={(e) => {
                const campo = e.value;
                setCamposOpcionales(prev => ({ ...prev, [campo]: '' }));
              }}
              placeholder="Agregar campo opcional"
              className="campo-opcional-dropdown"
              disabled={!esEmpresa}
            />

            {Object.entries(CamposOpcionales).map(([clave, valor]) => (
            <div key={clave} className="campoOpcional mb-3 flex align-items-center gap-2">
              <InputText
                value={valor}
                onChange={(e) =>
                  setCamposOpcionales(prev => ({ ...prev, [clave]: e.target.value }))
                }
                className="w-full"
                placeholder={`Ingrese ${labelsOpcionales[clave]}`}
              />
              <Button
                icon="pi pi-times"
                className="botonQuitarCampo"
                onClick={() =>
                  setCamposOpcionales(prev => {
                    const updated = { ...prev };
                    delete updated[clave];
                    return updated;
                  })
                }
                tooltip="Eliminar campo"
                tooltipOptions={{ position: 'top' }}
              />
            </div>
          ))}
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
          {!esEmpresa && (
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
          )}

          <InputText name="localidad" value={formData.localidad} onChange={handleChange} placeholder="Localidad" disabled={esEmpresa} hidden={esEmpresa}/>
          <InputText name="codPostal" value={formData.codPostal} onChange={handleChange} placeholder="Código Postal" disabled={esEmpresa} hidden={esEmpresa}/>
          <InputText name="direccion" value={formData.direccion} onChange={handleChange} placeholder="dirección" disabled={esEmpresa} hidden={esEmpresa}/>
          {!esEmpresa && (
            <InputNumber
              name="altura"
              value={formData.altura}
              onValueChange={(e) => setFormData({ ...formData, altura: e.value })}
              placeholder="Altura"
              disabled={esEmpresa}
            />
          )}

          <div className="campoCheckbox">
            <span>Acepto los términos</span>
            <Checkbox name="aceptaTerminos" checked={formData.aceptaTerminos} onChange={handleChange} />
          </div>

          {/* Firma de la empresa (solo visual si es usuario) */}
          <div className="firma-box">
            <label>Firma de la Empresa:</label>
            {formData.firmaVendedor && (
              <img src={formData.firmaVendedor} alt="Firma Empresa" className="firma-imagen" />
            )}
            {esEmpresa && (
              <Button
                label="Firmar"
                icon="pi pi-pencil"
                onClick={() => setShowSignatureDialog(true)}
                type="button"
                className="mt-2 botonForm"
              />
            )}
          </div>

          <div className="botones">
            <Button label="Cancelar" className="p-button-secondary" onClick={() => navigate(esEmpresa ? '/sellers' : '/')}  />
            {esEmpresa ? (
              location.state?.id? (
                <Button label='Editar Contrato' className='p-button-secondary' type='submit' hidden={!location.state.id} disabled={!formData.aceptaTerminos || !formData.firmaVendedor}/>
              ):(
                <Button label='Guardar Contrato' className="p-button-secondary" type="submit" hidden={location.state?.id} disabled={!formData.aceptaTerminos || !formData.firmaVendedor} />
            )) : (
              <Button label="Aceptar y Firmar" icon="pi pi-check" className="p-button-secondary" type="submit" disabled={!formData.aceptaTerminos} />
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