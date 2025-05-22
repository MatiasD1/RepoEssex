import { useEffect, useState, useRef } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { createUser, disableUser, getActiveUsers, showError, showSuccess } from './FirebaseSellers'
import { Toast } from 'primereact/toast';

const Administrator = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [newUser, setNewUser] = useState({
    email:'',
    role:'',
    name:''
  })
  
  const roles = ['sellers','administrator']
  const toast = useRef(null);
 
  

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      async (snapshot) => {
        let usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        usersData = await getActiveUsers();
        setUsers(usersData);
        setLoading(false);
      },
      (error) => {
        showError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);


  const handleUserAdd = async () => {
      setShowUserDialog(true);
      setNewUser({ email: '', role: '' ,name:''});
      setSelectedRole('');     
  }

  const HandleCreateUser = async () =>{
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
      name:newUser.name
    }
    await createUser(formData);
    toast.current?.show({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Usuario creado correctamente',
      life: 5000
    });
    
    setShowUserDialog(false);
    setNewUser({ email: '', role: '', name:'' });
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


  const HandleBaja = async () => {
    try {
      await disableUser();
      showSuccess("Usuario deshabilitado con éxito");
    } catch (error) {
      showError("Error al intentar deshabilitar el usuario");
    }
  }

  if (loading) {
    return (
        <div className="flex justify-content-center align-items-center" style={{ height: '60px' }}>
            <ProgressSpinner style={{ width: '40px', height: '40px' }} />
        </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
      <Toast ref={toast}/>
      <Button 
        icon="pi pi-plus"
        severity="success"
        rounded
        outlined
        toolip="Agregar Usuario"
        onClick={()=>handleUserAdd()}
      />

      <Dialog
        header={`Nuevo Usuario`}
        visible={showUserDialog}
        style={{width: '80vw' }}
        onHide={()=>setShowUserDialog(false)}
      >
        <div className='p-fluid'>
          <div className='field mb-4'>
            <label>Email:</label>
            <InputText
              id='email'
              name='email'
              placeholder='ingresa tu email'  
              className='w-full'
              value={newUser.email}
              onChange={(e)=>setNewUser({...newUser,email:e.target.value})}
            />
          </div>
          <div className='field mb-4'>
            <label>Rol:</label>
            <Dropdown
              id='role'
              name='role'
              placeholder='seleccioná el rol'
              className='w-full'
              value={selectedRole}
              options={roles}
              onChange={(e) => {
                setSelectedRole(e.value);
                setNewUser({...newUser, role: e.value});
              }}
            />
          </div>
          <div className='field mb-4'>
            <label>Nombre de Usuario:</label>
            <InputText
              id='name'
              name='name'
              placeholder='ingresa tu nombre de usuario'  
              className='w-full'
              value={newUser.name}
              onChange={(e)=>setNewUser({...newUser,name:e.target.value})}
            />
          </div>
        </div>
        <Button 
          label='Crear Usuario' 
          className='p-button-raised p-button-success p-d-block' 
          onClick={()=>HandleCreateUser()}
        />
      </Dialog>

      <DataTable
        value={users}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25]}
        tableStyle={{ minWidth: '50rem' }}
      >
        <Column field='email' header="Email"/>
        <Column field='role'  header="Rol"/>
        <Column field='name' header="Nombre"/>
        <Column field='deleteUser' body={
          <Button 
            icon="pi pi-times" 
            rounded 
            severity="danger" 
            aria-label="Cancel"
            onClick={()=>HandleBaja()} />
          }
        />
      </DataTable>
    </div>
  );
};

export default Administrator;