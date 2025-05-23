import { addDoc, collection, doc, setDoc, getDoc, updateDoc, query, where, deleteDoc } from "firebase/firestore"
import { db } from "../../firebase";
import { toast } from "react-toastify";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";

export const showSuccess = (message) => {
    toast.success(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
}

export const showError = (message) => {
    toast.error(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
}

export const getUserById = async (userId) => {
    try {
        const userRef = doc(db,"users",userId);
        const userSnap = await getDoc(userRef);
        return userSnap.data();
    } catch (error) {
        showError("Error usuario no encontrado")
    }
}

export const createUser = async (formData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      "123123"
    );
    const newUser = userCredential.user;
    await signOut(auth);
    await sendPasswordResetEmail(auth, formData.email);

    await setDoc(doc(db, "users", newUser.uid), {
      email: formData.email,
      role: formData.role,
      name: formData.name
    });
    //instrucciones al admin
    showSuccess("Usuario creado. Por favor, inicia sesión nuevamente como admin.");
  } catch (error) {
    showError(`Error: ${error.message}`);
  }
};
    

export const getActiveUsers = async () => {
    try {
        const q = query(
            collection(db,"users"),
            where("visible","==",true)
        );   
        return q;
    } catch (error) {
        showError("Error al obtener los usuarios");
        return [];
    }
}

export const getDisabledUsers = async () => {
    try {
        const q = query(
            collection(db,"users"),
            where("visible","==",false)
        );
        return q;
    } catch (error) {
        showError("Error al obtener los usuarios");
    }
}

export const updateUser = async (updatatedUser) => {
    try {
        await addDoc(collection(db,"users"),updatatedUser);
        showSuccess("Usuario actualizado con éxito");
    }
    catch (error) {
        showError("Error al actualizar el usuario");    
    }
}

export const enableUser = async (id)=>{
    try {
        await updateDoc(doc(db,"users",id),{
            visible:true,
            status:"active"
        })
        showSuccess("Usuario habilitado");
    } catch (error) {
        showError("Error al habilitar al usuario")
    }
}

export const disableUser = async (docId) => {
    try {
        await updateDoc(doc(db,"users",docId),{
            status:"disabled",
            visible:false
        })
        showSuccess("Usuario deshabilitado con éxito");
    } catch (error) {
        showError("Error al deshabilitar el usuario");
    }
}

export const deleteUser = async (id)=>{
    try {
        await deleteDoc(doc(db,"users",id));
        showSuccess("Usuario borrado, recordar borrar al usuario autenticado de uid = "+id);
    } catch (error) {
        showError("Error al borrar el usuario");
    }
}