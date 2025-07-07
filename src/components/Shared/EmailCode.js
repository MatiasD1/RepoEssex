import emailjs from "@emailjs/browser";
import { showError, showSuccess } from "../Administrator/FirebaseSellers";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export const generarCodigo = async (idContract) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const contractDoc = await getDoc(doc(db, "contracts", idContract));
    const link = `http://localhost:3000/sellers/ClientVerification?id=${idContract}&code=${code}`;
    if (!contractDoc.exists()) {
        throw new Error("Contrato no encontrado");
    }
    const contractData = contractDoc.data();
    const userName = await getDoc(doc(db,"users",contractData.userUID));
    if (!userName.exists()) {
        throw new Error("Usuario no encontrado");
    }
    const templateParams = {
        name: userName.data().name,
        code: code,
        email: userName.data().email,
        link:link
    };
    try {
        await emailjs.send(
            process.env.REACT_APP_EMAILJS_SERVICE_ID,
            process.env.REACT_APP_EMAILJS_TEMPLATE_ID, 
            templateParams,
            process.env.REACT_APP_EMAILJS_PUBLIC_KEY 
        );
        showSuccess("Código enviado correctamente al correo electrónico del usuario");
        await updateDoc(doc(db, "contracts", idContract), {
            codigoVerificacion: code
        });
    } catch (error) {
        showError("Error al enviar el correo electrónico:", error);
        throw new Error("Error al enviar el correo electrónico");
    }
}

export const enviarFormulario = async(idContract, email)=>{
    const link = `http://localhost:3000/sellers/New?id=${idContract}&mode=usuario`;
    const contractDoc = await getDoc(doc(db, "contracts", idContract));
    const contractData = contractDoc.data();
    const userDoc = await getDoc(doc(db, "users", contractData.userUID));
    const userData = userDoc.data();
    const templateParams = {
        name: userData.name,
        email: email,
        link: link
    };
    try {
        await emailjs.send(
            process.env.REACT_APP_EMAILJS_SERVICE_ID,
            process.env.REACT_APP_EMAILJS_TEMPLATE_ID2, 
            templateParams,
            process.env.REACT_APP_EMAILJS_PUBLIC_KEY 
        );
        showSuccess("Formulario enviado correctamente al correo electrónico del usuario");
    } catch (error) {
        showError("Error al enviar el formulario:", error);
        throw new Error("Error al enviar el formulario");
    }
}