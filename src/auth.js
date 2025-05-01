import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth"; //Funciones para las 3 
import { setDoc, doc,getDoc } from "firebase/firestore"; // Obtener datos de firestore
import { auth, db } from "./firebase"; // Manejo de autenticacion y bdd de firebase

// Función para autenticar al usuario
export const authenticateUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password); // Llama a la funcion de Firebase con un instancia de la autenticacion, el mail y password ingresados
    console.log("✅ Usuario autenticado:", userCredential.user.uid);
    return userCredential.user; // Si la autenticación es exitosa, retorna el usuario
  } catch (error) {
    console.error("❌ Error de autenticación:", error.code, error.message); 
    throw error; // Maneja el error en el componente
  }
};

// Función para registrar un nuevo usuario (con rol fijo "user")
export const registerUser = async (email, password) => {
  try {

    const userCredential = await createUserWithEmailAndPassword(auth, email, password); // Crea un nuevo usuario con la instancia de autenticacion y los datos ingresados
    const user = userCredential.user; 
    
    console.log("✅ Usuario registrado en Firebase Auth:", user.uid);

    // Guarda los datos en Authentication
    await setDoc(doc(db, "usuarios", user.uid), {
      email: email,
      role: "user"
    });

    console.log("✅ Usuario guardado en Firestore");
    return user; // Si sale bien, retorna el usuario
  } catch (error) {
    console.error("❌ Error de registro:", error.code, error.message);
    throw error;
  }
};

// Función para cerrar sesión
export const logoutUser = async () => {
  try {
    await signOut(auth); // Cierra la sesión de la autenticación
    console.log("Usuario deslogueado con éxito");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};

// Función para obtener el usuario desde firestore
export const getUserFromFirestore = async (userId) => {
  try {
    const userRef = doc(db, "users", userId); // ¡Corrección clave aquí!
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("El usuario no existe en Firestore");
    }
    
    return { id: userDoc.id, ...userDoc.data() };
  } catch (error) {
    console.error("Error en getUserFromFirestore:", error);
    throw error; // Propaga el error para manejarlo en el componente
  }
};