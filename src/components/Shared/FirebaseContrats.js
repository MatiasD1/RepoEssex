// firebaseContracts.js
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, addDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { StyleSheet, Text, View, Document, Page, pdf, Image } from "@react-pdf/renderer";
import { showError } from "../Administrator/FirebaseSellers";



  export const createContract = async (contractData) => {
    if (!auth.currentUser) throw new Error("Usuario no autenticado");
    const contractDoc = {
      titulo: contractData.titulo,
      contenido: contractData.contenido,
      nombre: contractData.nombre,
      apellido: contractData.apellido,
      dni: contractData.dni,
      monto: contractData.monto,
      fechaInicio: contractData.fechaInicio,
      fechaFin: contractData.fechaFin,
      incluyePenalizacion: contractData.incluyePenalizacion,
      aceptaTerminos: contractData.aceptaTerminos,
      firmaVendedor: contractData.firma,
      firmaCliente: "", // o lo que corresponda según tu lógica
      userUID: auth.currentUser.uid,
      createdAt: serverTimestamp(),
      status: contractData.firma ? "activo" : "inactivo",
      provincia:contractData.provincia,
      localidad:contractData.localidad,
      codPostal:contractData.codPostal,
      email:contractData.email,
    };
    console.log("Guardando contrato:", contractDoc);

    const docRef = await addDoc(collection(db, "contracts"), contractDoc);
      return docRef.id;

  };

  export const formatDate = (dateString) => {
    if (!dateString) return '';
    if (dateString?.toDate){
      return dateString.toDate().toLocaleDateString('es-ES');
    }else if (dateString?.seconds) {
      return new Date(dateString.seconds * 1000).toLocaleDateString('es-ES');
    }
    return 'Fecha no disponible';
  };

  export const getContractById = async (id) => {
    try {
      const docRef = doc(db,"users",id);
      const docSnap = await getDoc(docRef);
      return {id:docSnap.id, ...docSnap.data()};
    } catch (error) {
      showError("Error al recuperar el contrato");
      return {};
    }
    
  }

  export const getUserContracts = async () => {
    if (!auth.currentUser) throw new Error("No autenticado");

    const q = query(
      collection(db, "contracts"),
      where("userUID", "==", auth.currentUser.uid)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  export const deleteContract = async (contractId) => {
    if (!auth.currentUser) throw new Error("No autenticado");
    const contractRef = doc(db, "contracts", contractId);
    const contractSnap = await getDoc(contractRef);
    if (!contractSnap.exists()) {
      throw new Error("El contrato no existe");
    }
    if (contractSnap.data().userUID !== auth.currentUser.uid) {
      throw new Error("No tienes permiso para eliminar este contrato");
    }
    await deleteDoc(contractRef);
  };

  // Verificación de propiedad usando UID directo
  const verifyOwnership = async (contractId) => {
    if (!auth.currentUser) throw new Error("Usuario no autenticado");
    
    const contractRef = doc(db, "contracts", contractId);
    const contractSnap = await getDoc(contractRef);
    
    if (!contractSnap.exists()) {
      throw new Error("El contrato no existe");
    }
    
    if (contractSnap.data()._owner !== auth.currentUser.uid) {
      throw new Error("No tienes permiso para esta acción");
    }
    
    return contractSnap;
  };

  // Actualizar contrato con verificación por UID
  export const updateUserContract = async (contractId, newData) => {
    await verifyOwnership(contractId);
    await updateDoc(doc(db, "contracts", contractId), newData);
  };

  // Eliminar contrato con verificación por UID
  export const deleteUserContract = async (contractId) => {
    await verifyOwnership(contractId);
    await deleteDoc(doc(db, "contracts", contractId));
  };


  // Estilos
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

  // Componente PDF separado
  const MyDocument = ({ contract, formatDate }) => (
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
          {contract.incluyePenalizacion ? '- Incluye penalización por mora' : ''}
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

  // Función para generar el PDF
  export const generatePDF = async (contract, formatDate) => {
    try {
      const blob = await pdf(<MyDocument contract={contract} formatDate={formatDate} />).toBlob();
      return blob;
    } catch (error) {
      throw error;
    }
  };
