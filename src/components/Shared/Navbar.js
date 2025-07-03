import React, { useState, useEffect } from 'react';
import { Menubar } from 'primereact/menubar';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const Navbar = ({user}) => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setCurrentUser(user);
            setLoading(false);
        }else{
            setCurrentUser(null);
            setLoading(true);
        }
    },[user]);
    
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
            command: () => navigate('/')
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
                    command: () => navigate('/sellers/new',{state:{user}})
                },
                {
                    label: 'Mis Contratos',
                    icon: 'pi pi-list',
                    command: () => navigate('/')
                },
                {
                    label: 'Plantillas',
                    icon: 'pi pi-copy',
                    command: () => navigate('/sellers/ContractsList')
                }
            ]
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
                    command: () => navigate('/administrator/contractsListAdmin')
                },
                {
                    label: 'Vendedores',
                    icon: 'pi pi-users',
                    command: () => navigate('/')
                },
                {
                    label: 'Reportes',
                    icon: 'pi pi-chart-bar',
                    command: () => navigate('/administrator/reports')
                },
                {
                    label:'Usuarios Deshabilitados',
                    icon:'pi pi-users',
                    command:()=> navigate('/administrator/disabled')
                }
            ]
        }        
    ];

    if (loading) {
        return <div>Cargando...</div>;
    }

    const roleSpecificItems = currentUser?.role === 'administrator' ? adminItems : sellerItems;
    const items = [...commonItems, ...roleSpecificItems];

    const endItems = currentUser ? (
        <div className="flex align-items-center gap-2">
            <Button 
                label={currentUser.name || 'Perfil'} 
                icon="pi pi-user" 
                className="p-button-text p-button-plain" 
                onClick={() => navigate(`/profile`, { state: { user: user } })}
            />
            <Button 
                icon="pi pi-sign-out" 
                className="botonCerrar" 
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
        <div className='navbar' id='navbar'>
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
        </div>
    );
};

export default Navbar;