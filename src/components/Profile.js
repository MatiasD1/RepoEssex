import  { useEffect, useState, useRef } from 'react'
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { useLocation } from 'react-router-dom';


const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const toast = useRef(null);

    useEffect(() => {
        const currentUser = location.state?.user;
        if (currentUser) {
            setUser(currentUser);
            setLoading(false);
        } else {
            setLoading(true);
            toast.current.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'No se encontró información del usuario',
                life: 3000,
            });
        }
    }, [location.state]);


  if (loading) {
        return (
            <div className="flex align-items-center justify-content-center min-h-screen bg-gray-100">
                <ProgressSpinner />
            </div>
        );
    }  
  return (
        <div className="flex align-items-center justify-content-center min-h-screen bg-gray-100">
            <Toast ref={toast} position='top-right'/>
            <Card 
                title="Información de Usuario" 
                className="w-full md:w-6 lg:w-4"
                style={{ maxWidth: '500px' }}
            >
                <div className="p-fluid">
                    <div className="field mb-4">
                        <label htmlFor="email" className="block text-900 font-medium mb-2">
                            Email
                        </label>
                        <InputText
                            id="email"
                            name="email"
                            value={user.email}
                            readOnly
                            className="w-full read-only-input"
                        />
                    </div>
                    
                    <div className="field mb-4">
                        <label htmlFor="role" className="block text-900 font-medium mb-2">
                            Role
                        </label>
                        <InputText
                            id="role"
                            name="role"
                            value={user.role}
                            readOnly
                            className="w-full read-only-input"
                        />
                    </div>
                </div>

                <div className="mt-4 p-3 border-round bg-blue-100 text-blue-800 flex align-items-center">
                    <i className="pi pi-info-circle mr-2"></i>
                    <span>Este formulario es solo para visualización</span>
                </div>
            </Card>

            {/* Estilos personalizados para los campos de solo lectura */}
            <style jsx>{`
                .read-only-input .p-inputtext {
                    background-color: #f8f9fa;
                    border-color: #dee2e6;
                    color: #495057;
                    cursor: default;
                }
                .read-only-input .p-inputtext:enabled:focus {
                    box-shadow: none;
                    border-color: #dee2e6;
                }
            `}</style>
        </div>
    );
}

export default Profile
