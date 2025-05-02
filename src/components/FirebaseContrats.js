// firebaseContracts.js
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";


export const createContract = async (contractData) => {
  if (!auth.currentUser) throw new Error("Usuario no autenticado");

  const contractDoc = {
    ...contractData,
    userUID: auth.currentUser.uid, // Campo CRÍTICO que vincula al usuario
    createdAt: serverTimestamp(),
    status: "activo"
  };

  const docRef = await addDoc(collection(db, "contracts"), contractDoc);
  return docRef.id; // Retorna el ID automático del nuevo contrato
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