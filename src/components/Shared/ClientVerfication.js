import { InputText } from "primereact/inputtext";
import { Panel } from "primereact/panel";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { showError, showSuccess } from "../Administrator/FirebaseSellers";
import ContractDetail from "./ContractDetail";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { verifcarCódigo } from "../Verification-Api/ApiVer";

const ClientVerification = () => {
  const [contract, setContract] = useState(null);
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("id");

    const fetchContract = async () => {
      try {
        const contractDoc = await getDoc(doc(db, "contracts", id));
        if (!contractDoc.exists()) {
          showError("Contrato no encontrado");
          return;
        }
        setContract({ ...contractDoc.data(), id: contractDoc.id });
      } catch (error) {
        showError("Error al obtener el contrato");
        console.error(error);
      }
    };

    if (id) {
      fetchContract();
    }
  }, [location]);

  return (
    <div>
      <Panel
        header="Verificación de Código"
        className="w-full md:w-25rem"
        style={{ marginTop: "2rem" }}
      >
        <div className="flex flex-col items-center justify-center">
          <p className="text-center">
            Ingresá el código de verificación enviado a tu email.
          </p>
          <InputText
            value={code}
            onValueChange={(e) => setCode(e.target.value)}
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
                const esValido = await verifcarCódigo(contract.id, code.trim());
                if (!esValido) {
                  showError("Código incorrecto");
                  return;
                }
                showSuccess("Código verificado con éxito");
                setVerified(true);
                await updateDoc(doc(db, "contracts", contract.id), { verificado: true });
              } catch (error) {
                showError("Error al verificar el código");
              }
            }}
          />
        </div>
      </Panel>

      {verified && contract && (
        <Panel
          header="Contrato Verificado"
          className="w-full md:w-25rem mt-4"
        >
          <ContractDetail contract={contract} />
        </Panel>
      )}
    </div>
  );
};

export default ClientVerification;
