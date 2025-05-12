import  { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';

const Profile = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                const userData = userDoc.data();
                setUser(userData);
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);
  return (
        <div className="flex align-items-center justify-content-center min-h-screen bg-gray-100">
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
