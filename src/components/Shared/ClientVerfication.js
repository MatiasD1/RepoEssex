import { InputText } from "primereact/inputtext";
import { Panel } from "primereact/panel";
import { Button } from "primereact/button";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { showError, showSuccess } from "../Administrator/FirebaseSellers";
import ContractDetail from "./ContractDetail";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { verifcarCódigo } from "../Verification-Api/ApiVer";
import { Dialog } from "primereact/dialog";
import SignatureCanvas from "react-signature-canvas";
import { Toast } from 'primereact/toast';
import { getAuth, signOut } from "firebase/auth";

const ClientVerification = () => {
  const [contract, setContract] = useState(null);
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const signatureRef = useRef(null);
  const toast = useRef(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("id");
    const fetchContract = async () => {
      try {
        const auth = getAuth();
        if (auth.currentUser) {
          await signOut(auth);
        } 
        const contractDoc = await getDoc(doc(db, "contracts", id));
        if (!contractDoc.exists()) {
          showError("Contrato no encontrado");
          return;
        }
        setContract({ ...contractDoc.data(), id: contractDoc.id });
        setLoading(false);
      } catch (error) {
        showError("Error al obtener el contrato");
        setLoading(true);
        console.error(error);
      }
    };

    if (id && loading) {
      fetchContract();
    }
  }, [location, loading]);


  const handleSaveSignature = async() => {
    if (signatureRef.current.isEmpty()) return showError('Proporcione una firma');
    await updateDoc(doc(db,"contracts",contract.id),{firmaUsuario:signatureRef.current.toDataURL()});
    setContract(prev => ({ ...prev, firmaUsuario: signatureRef.current.toDataURL() }));
    setShowSignatureDialog(false);
    showSuccess('Firma guardada');
  };

  return (
    <div>
      <Toast ref={toast} />
      <Panel
        header="Verificación de Código"
        className="w-full md:w-25rem"
        style={{ marginTop: "2rem" }}
      >
        <div className="flex flex-col items-center justify-center">
          <p className="text-center">
            Ingresá el código de verificación enviado a tu email o celular
            e ingresá tu firma digital.
          </p>
          <InputText
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Código de verificación"
            className="w-full md:w-20rem mb-4"
            buttonLayout="horizontal"
          />
          <Button
            label="Verificar"
            className="p-button-success"
            onClick={async () => {
              if (!code || code.trim() === "") {
                showError("Ingresá un código válido");
                return;
              }
              try {
                console.log("Codigo ingresado :", code);
                const esValido = await verifcarCódigo(contract.id, code.trim());
                if (!esValido) {
                  showError("Código incorrecto");
                  return;
                }
                showSuccess("Código verificado con éxito");
                setVerified(true);
                await updateDoc(doc(db, "contracts", contract.id), { verificado: true, status:"activo" });
              } catch (error) {
                showError("Error al verificar el código, código incorrecto o expirado(válido por 72 horas)");
              }
            }}
          />
          <div className="firma-box">
              <label>Firma del Usuario:</label>
              {contract?.firmaUsuario ? (
                <img src={contract.firmaUsuario} alt="Firma Usuario" className="firma-imagen" />
              ) : (
                <p className="text-sm text-gray-500 italic">Aún no se ha firmado.</p>
              )}
              <Button
                label="Firmar"
                icon="pi pi-pencil"
                onClick={() => setShowSignatureDialog(true)}
                type="button"
                className="mt-2 botonForm"
              />
          </div>
        </div>
      </Panel>

      {verified && contract.firmaUsuario? (
        <Panel
          header="Contrato Verificado"
          className="w-full md:w-25rem mt-4"
        >
          <ContractDetail contract={contract} />
        </Panel>
      ):(
        <p>Código no verificado o falta la firma.</p>
      )}

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

export default ClientVerification;
