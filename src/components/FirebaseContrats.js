// firebaseContracts.js
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";


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
    firma: contractData.firma, // Guardamos la firma en base64
    userUID: auth.currentUser.uid,
    createdAt: serverTimestamp(),
    status: contractData.firma?"activo":"inactivo"
  };

  const docRef = await addDoc(collection(db, "contracts"), contractDoc);
  return docRef.id; // Retorna el ID automático del nuevo contrato
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