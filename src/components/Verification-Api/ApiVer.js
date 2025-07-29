import axios from "axios";

const url = "https://api-essex.onrender.com/api/verificacion";

export const completarContrato = async (email, idContrato)=>{
    try {
        const response = await axios.post(`${url}/completar-contrato/${email}/${idContrato}`);
        return response.data;
    } catch (error) {
        console.log("Error al enviar link: "+ error);
    }
}

export const generarCodigo = async (Body) => {
    try {
        const response = await axios.post(`${url}/generar-codigo-email`,Body);
        return response.data;
    } catch (error) {
        console.log("Error al generar el código por email: "+ error);
    }
}

export const generarCodigoSms = async (telefono) =>{
    try {
        const response = await axios.post(`${url}/generar-codigo-sms/${telefono}`);
        return response.data;
    } catch (error) {
        console.log("Error enviando el código por sms: "+error);
    }
}

export const verifcarCódigo = async (idContrato, codigo)=>{
    try {
        const response = await axios.post(`${url}/verificar-codigo/${idContrato}?codigoIngresado=${encodeURIComponent(codigo)}`);
        return response.data;
    } catch (error) {
        console.log("Error al verificar el código: "+ error);
    }
}