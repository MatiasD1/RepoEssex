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
      nombre: contractData.nombre || "",
      apellido: contractData.apellido || "",
      dni: contractData.dni || "",
      monto: contractData.monto,
      fechaInicio: contractData.fechaInicio,
      fechaFin: contractData.fechaFin,
      incluyePenalizacion: contractData.incluyePenalizacion,
      aceptaTerminos: contractData.aceptaTerminos,
      firmaVendedor: contractData.firmaVendedor,
      firmaUsuario: "", 
      userUID: auth.currentUser.uid,
      createdAt: serverTimestamp(),
      status: "inactivo",
      provincia:contractData.provincia || "",
      localidad:contractData.localidad || "",
      codPostal:contractData.codPostal || "",
      email:contractData.email,
      telefono: contractData.telefono || "",
      altura: contractData.altura || "",
      nombreEmpresa: contractData.nombreEmpresa || "",
      emailEmpresa: contractData.emailEmpresa || "",
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
  const colors = {
  Black: '#000000',
  Zero: '#ffc180',
  Primario: '#F8A145',
  Secundario: '#F07900',
  Terciario: '#D35100',
  Hover: '#ff8c19',
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff', // fondo blanco limpio
    padding: 20,
    fontFamily: 'Helvetica', // jsPDF no tiene Open Sans nativo, Helvetica va bien
    fontSize: 12,
    color: colors.Black,
  },
  title: {
    fontSize: 24,
    color: colors.Primario,
    marginBottom: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    color: colors.Terciario,
    marginTop: 20,
    marginBottom: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  paragraph: {
    fontSize: 12,
    color: colors.Black,
    marginBottom: 6,
    lineHeight: 1.4,
  },
  signatureSection: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: 150,
    borderTopWidth: 1,
    borderTopColor: colors.Zero,
    paddingTop: 6,
    alignItems: 'center',
  },
  signatureLabel: {
    fontSize: 12,
    color: colors.Secundario,
    marginBottom: 6,
    fontWeight: '600',
  },
  signatureImage: {
    width: 150,
    height: 60,
    marginTop: 10,
  },
  nameDniText: {
    marginTop: 12,
    fontSize: 12,
    color: colors.Black,
    textAlign: 'center',
    lineHeight: 1.3,
  },
});

  // Componente PDF separado
  const MyDocument = ({ contract, formatDate, user }) => (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>{contract.titulo}</Text>
        
        <Text style={styles.sectionTitle}>PARTES CONTRATANTES:</Text>
        <Text>
          {`Entre ${contract.nombre} ${contract.apellido}, identificado con DNI ${contract.dni}, `}
          {`y ${user?.name}, celebran el presente contrato con fecha ${formatDate(contract.fechaInicio)}.`}
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
          <View style={styles.signatureLine}>
            <Text>Firma del Cliente:</Text>
            {contract.firmaUsuario && (
              <Image 
                src={contract.firmaUsuario} 
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
            <Text>Firma de la Empresa:</Text>
            <View style={styles.signatureLine}>
            {contract.firmaVendedor && (
              <Image 
                src={contract.firmaVendedor} 
                style={{ width: 150, height: 60, marginTop: 10 }} 
              />
            )}
            </View>
              <Text style={{ marginTop: 20 }}>
                {user?.name || '[Nombre Representante]'}
              </Text>
            </View>
        </View>
      </Page>
    </Document>
  );

  // Función para generar el PDF
  export const generatePDF = async (contract, formatDate, user) => {
    try {
      const blob = await pdf(<MyDocument contract={contract} formatDate={formatDate} user={user}/>).toBlob();
      return blob;
    } catch (error) {
      throw error;
    }
  };
