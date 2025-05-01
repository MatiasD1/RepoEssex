import React, { useState, useEffect } from 'react';
import { Menubar } from 'primereact/menubar';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { getUserFromFirestore } from '../auth'; // Importa tus funciones
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const Navbar = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const userData = await getUserFromFirestore(user.uid);
                    setCurrentUser({
                        uid: user.uid,
                        email: user.email,
                        ...userData
                    });
                } catch (error) {
                    console.error("Error obteniendo datos del usuario:", error);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setCurrentUser(null);
            navigate('/login');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    // Items comunes
    const commonItems = [
        {
            label: 'Inicio',
            icon: 'pi pi-home',
            command: () => navigate('/dashboard')
        }
    ];

    // Items para vendedores
    const sellerItems = [
        {
            label: 'Contratos',
            icon: 'pi pi-file',
            items: [
                {
                    label: 'Nuevo Contrato',
                    icon: 'pi pi-plus',
                    command: () => navigate('/contracts/new')
                },
                {
                    label: 'Mis Contratos',
                    icon: 'pi pi-list',
                    command: () => navigate('/contracts')
                },
                {
                    label: 'Plantillas',
                    icon: 'pi pi-copy',
                    command: () => navigate('/templates')
                }
            ]
        },
        {
            label: 'Firmar',
            icon: 'pi pi-pencil',
            command: () => navigate('/sign')
        }
    ];

    // Items para administradores
    const adminItems = [
        {
            label: 'Gestión',
            icon: 'pi pi-users',
            items: [
                {
                    label: 'Todos los Contratos',
                    icon: 'pi pi-folder-open',
                    command: () => navigate('/admin/contracts')
                },
                {
                    label: 'Vendedores',
                    icon: 'pi pi-users',
                    command: () => navigate('/admin/sellers')
                },
                {
                    label: 'Reportes',
                    icon: 'pi pi-chart-bar',
                    command: () => navigate('/admin/reports')
                }
            ]
        },
        {
            label: 'Filtros Avanzados',
            icon: 'pi pi-filter',
            command: () => navigate('/admin/filters')
        }
    ];

    if (loading) {
        return <div>Cargando...</div>;
    }

    const roleSpecificItems = currentUser?.role === 'admin' ? adminItems : sellerItems;
    const items = [...commonItems, ...roleSpecificItems];

    const endItems = currentUser ? (
        <div className="flex align-items-center gap-2">
            <Button 
                label={currentUser.email || 'Perfil'} 
                icon="pi pi-user" 
                className="p-button-text p-button-plain" 
                onClick={() => navigate('/profile')}
            />
            <Button 
                icon="pi pi-sign-out" 
                className="p-button-danger" 
                tooltip="Cerrar sesión"
                tooltipOptions={{ position: 'bottom' }}
                onClick={handleLogout}
            />
        </div>
    ) : (
        <div className="flex align-items-center gap-2">
            <Button 
                label="Iniciar sesión" 
                className="p-button-text" 
                onClick={() => navigate('/login')}
            />
            <Button 
                label="Registrarse" 
                className="p-button-outlined" 
                onClick={() => navigate('/register')}
            />
        </div>
    );

    return (
        <Menubar 
            model={items} 
            end={endItems}
            className="navbar-custom"
            style={{ 
                border: 'none',
                borderBottom: '1px solid #e5e7eb',
                borderRadius: 0,
                padding: '0.5rem 2rem'
            }}
        />
    );
};

export default Navbar;