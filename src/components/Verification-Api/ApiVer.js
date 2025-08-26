import axios from "axios";

const url = "http://179.43.117.6:8080/api/verificacion"||"https://api-essex.onrender.com/api/verificacion";

export const generarToken = async (id) =>{
    try {
        const response = await axios.post(`${url}/${id}/generar-token` );
        return response.data;
    } catch (error) {
        console.log("Error al generar el token: "+ error);
    }
}

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

export const generarCodigoSms = async (telefono, idContrato) =>{
    try {
        const response = await axios.post(`${url}/generar-codigo-sms/${telefono}/${idContrato}`);
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