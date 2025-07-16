import { useEffect, useState, useRef } from 'react';
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
            <div className="profile-container">
                <ProgressSpinner />
            </div>
        );
    }

    return (
        <div className="profile-container">
            <Toast ref={toast} position="top-right" />
            <Card className="profile-card">
                <h2 className="text-2xl font-bold mb-4">Información de Usuario</h2>
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
                            Rol
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

                <div className="info-box">
                    <i className="pi pi-info-circle"></i>
                    <span>Este formulario es solo para visualización</span>
                </div>
            </Card>
        </div>
    );
};

export default Profile;
