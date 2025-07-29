import { useEffect, useState, useRef } from 'react';
import {  onSnapshot } from 'firebase/firestore';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { createUser, disableUser, getActiveUsers, showError, showSuccess } from './FirebaseSellers'
import { Toast } from 'primereact/toast';
import Swal from 'sweetalert2';

const Administrator = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [newUser, setNewUser] = useState({
    email: '',
    role: '',
    name: ''
  })

  const roles = ['sellers', 'administrator']
  const toast = useRef(null);



  useEffect(() => {
    getActiveUsers()
      .then(q => {
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const usersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setUsers(usersData);
          setLoading(false);
        },
          (error) => {
            showError(error);
            setLoading(true);
          });
        return () => unsubscribe();
      })
      .catch(error => {
        showError(error);
        setLoading(false);
      });
  }, []);


  const handleUserAdd = async () => {
    setShowUserDialog(true);
    setNewUser({ email: '', role: '', name: '' });
    setSelectedRole('');
  }

  const HandleCreateUser = async () => {
    try {
      if (!newUser.email || !selectedRole || !newUser.name) {
        toast.current?.show({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'Por favor complete todos los campos',
          life: 5000
        });
        return;
      }
      const formData = {
        email: newUser.email,
        role: selectedRole,
        name: newUser.name
      }
      await createUser(formData);
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Usuario creado correctamente',
        life: 5000
      });

      setShowUserDialog(false);
      setNewUser({ email: '', role: '', name: '' });
      setSelectedRole('');
    } catch (error) {
      console.error("Error creating user:", error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al crear el usuario: ' + error.message,
        life: 5000
      });
    }
  }


  const HandleBaja = async (id) => {
  try {
    await disableUser(id); 
    showSuccess("Usuario deshabilitado con éxito");
  } catch (error) {
    showError("Error al intentar deshabilitar el usuario");
  }
};

  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ height: '60px' }}>
        <ProgressSpinner style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  return (
    <div className="p-4" id='administrador'>
      <h2 className="text-2xl font-bold mb-4">Panel de Administración</h2>
      <Toast ref={toast} />
      <Button
        className='botonMas'
        icon="pi pi-plus"
        severity="success"
        rounded
        outlined
        tooltip="Agregar Usuario"
        onClick={() => handleUserAdd()}
      />

      <Dialog
        className="custom-dialog"
        header={`Crear Nuevo Usuario`}
        visible={showUserDialog}
        style={{ width: '80vw' }}
        onHide={() => setShowUserDialog(false)}
      >
        <div className='p-fluid'>
          <div className='field mb-4'>
            <label>Email:</label>
            <InputText
              id='email'
              name='email'
              placeholder='Ingresa un email'
              className='w-full'
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </div>
          <div className='field mb-4'>
            <label>Rol:</label>
            <Dropdown
              id='role'
              name='role'
              placeholder='Seleccioná el rol'
              className='w-full'
              value={selectedRole}
              options={roles}
              onChange={(e) => {
                setSelectedRole(e.value);
                setNewUser({ ...newUser, role: e.value });
              }}
            />
          </div>
          <div className='field mb-4'>
            <label>Nombre de Usuario:</label>
            <InputText
              id='name'
              name='name'
              placeholder='Ingresa un nombre de usuario'
              className='w-full'
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
          </div>
        </div>
        <div className="crearUsuarioFooter">
          <Button
            label="Crear Usuario"
            className="crearUsuarioBtn"
            onClick={()=>HandleCreateUser}
          />
        </div>
  
      </Dialog>

      <DataTable
        value={users}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25]}
        responsiveLayout="scroll" 
        tableStyle={{ minWidth: '100%' }}
        rowClassName={(rowData) => {
          const index = users.findIndex(u => u.id === rowData.id);
          return index % 2 === 0 ? 'fila-par' : 'fila-impar';
        }}
      >

        <Column field='email' header="Email" />
        <Column field='role' header="Rol" />
        <Column
          header="Nombre"
          body={(rowData) => `${rowData.name} ${rowData.apellido || ''}`}
        />
        <Column
          header="Dar de baja"
          body={(rowData) => (
            <div className='accionesBotones'>
              <Button
              icon="pi pi-times"
              className="btn-accion btn-pdf"
              tooltip="Dar de baja"
              tooltipOptions={{ position: 'bottom' }}
              onClick={() => {
                Swal.fire({
                  title: '¿Estás seguro?',
                  text: 'El usuario será deshabilitado',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonText: 'Sí, deshabilitar',
                  cancelButtonText: 'Cancelar',
                  customClass: {
                    popup: 'mi-popup',
                    title: 'mi-titulo',
                    confirmButton: 'mi-boton-confirmar',
                    cancelButton: 'mi-boton-cancelar',
                    icon: 'iconoSA',
                  }
                }).then((result) => {
                  if (result.isConfirmed) {
                    HandleBaja(rowData.id);
                  }
                });
              }}
            />
            </div>
          )}
          style={{ width: '110px', whiteSpace: 'nowrap' }}
          bodyStyle={{ textAlign: 'center'}}
        />
      </DataTable>
    </div>
  );
};

export default Administrator;