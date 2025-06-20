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
    await setDoc(doc(db, "users", newUser.uid), {
      email: formData.email,
      role: formData.role,
      name: formData.name,
      visible:true,
      status: "active"
    });
    await signOut(auth);
    await sendPasswordResetEmail(auth, formData.email);
    
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

    export const disableUser = async (userId) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        disabled: true,
        visible: false
    });
    };

export const deleteUser = async (id)=>{
    try {
        const userRef = doc(db,"users",id);
        const userSnap = getDoc(userRef); 
        await deleteDoc(userRef);
        showSuccess("Usuario borrado, recordar borrar al usuario autenticado de uid = "+ id +" y email = ",+(await userSnap).data().email);
    } catch (error) {
        showError("Error al borrar el usuario");
    }
}