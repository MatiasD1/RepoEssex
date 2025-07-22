import React, { useState, useEffect, useRef } from 'react';
import { Menubar } from 'primereact/menubar';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { OverlayPanel } from 'primereact/overlaypanel';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const op = useRef(null); // ref para OverlayPanel
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      setLoading(false);
    } else {
      setCurrentUser(null);
      setLoading(true);
    }
  }, [user]);

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
      id: 'navbar',
      label: 'Inicio',
      icon: 'pi pi-home',
      command: () => navigate('/')
    }
  ];

  // Items para vendedores
  const sellerItems = [
    {
      label: 'Contratos',
      id: 'navbar',
      icon: 'pi pi-file',
      items: [
        {
          label: 'Nuevo Contrato',
          icon: 'pi pi-plus',
          command: () => navigate('/sellers/new', { state: { user } })
        },
      /*  {
          label: 'Mis Contratos',
          icon: 'pi pi-list',
          command: () => navigate('/')
        },  */
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
      id: 'navbar',
      icon: 'pi pi-users',
      items: [
        {
          label: 'Todos los Contratos',
          icon: 'pi pi-folder-open',
          command: () => navigate('/administrator/contractsListAdmin')
        },
     /*   {
          label: 'Vendedores',
          icon: 'pi pi-users',
          command: () => navigate('/')
        },   */
        {
          label: 'Reportes',
          icon: 'pi pi-chart-bar',
          command: () => navigate('/administrator/reports')
        },
        {
          label: 'Usuarios Deshabilitados',
          icon: 'pi pi-users',
          command: () => navigate('/administrator/disabled')
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
    <>
      <Button
        label={currentUser.nombre || 'Perfil'}
        id='navbar'
        icon="pi pi-user"
        className="p-button-text p-button-plain"
        onClick={() => navigate(`/profile`, { state: { user } })}
      />
      <Button
        id='navbar'
        icon="pi pi-sign-out"
        className="botonCerrar"
        tooltip="Cerrar sesión"
        tooltipOptions={{ position: 'bottom' }}
        onClick={handleLogout}
      />
    </>
  ) : (
    <>
      <Button
        id='navbar'
        label="Iniciar sesión"
        className="p-button-text"
        onClick={() => navigate('/login')}
      />
      <Button
      id='navbar'
        label="Registrarse"
        className="p-button-outlined"
        onClick={() => navigate('/register')}
      />
    </>
  );

  // Función para renderizar items en el OverlayPanel
  const renderMenuItems = (menuItems) => {
    return menuItems.map((item, idx) => {
      if (item.items) {
        // Submenú: renderizamos label y los hijos indentados
        return (
          <div key={idx} style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'default' }}>
              <i id='navbar' className={item.icon}></i> {item.label}
            </div>
            <div style={{ marginLeft: '1rem' }}>
              {renderMenuItems(item.items)}
            </div>
          </div>
        );
      }

      return (
        <div
          id='navbar'
          key={idx}
          onClick={() => {
            item.command && item.command();
            op.current?.hide();
          }}
          
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0' }}
          onKeyDown={(e) => { if (e.key === 'Enter') { item.command && item.command(); op.current?.hide(); }}}
          tabIndex={0}
          role="menuitem"
        >
          <i id='navbar' className={item.icon}></i> {item.label}
        </div>
      );
    });
  };

  return (
    <nav className="navbar-container">
      {/* Menubar en desktop */}
      <div className="desktop-navbar">
        <Menubar
          model={items}
          end={<div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>{endItems}</div>}
          className="navbar-custom"
          style={{
            border: 'none',
            borderBottom: '1px solid #e5e7eb',
            borderRadius: 0,
            padding: '0.5rem 2rem'
          }}
        />
      </div>

      {/* Botón hamburguesa en móvil/tablet */}
      <div className="mobile-navbar">
        <Button
          icon="pi pi-bars"
          className="p-button-rounded p-button-text"
          aria-label="Abrir menú"
          onClick={(e) => op.current.toggle(e)}
        />

        <OverlayPanel ref={op} showCloseIcon dismissable style={{ width: '250px' }}>
          <div role="menu" aria-label="Menú de navegación">
            {renderMenuItems(items)}
            <hr />
            <div style={{ marginTop: '0.5rem' }}>
              {endItems}
            </div>
          </div>
        </OverlayPanel>
      </div>

    </nav>
  );
};

export default Navbar;
