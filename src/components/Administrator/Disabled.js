import { useEffect, useState } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { deleteUser, enableUser, getDisabledUsers, showError } from './FirebaseSellers';
import { ProgressSpinner } from 'primereact/progressspinner';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import Swal from 'sweetalert2';

const Disabled = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDisabledUsers()
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


    const actionTemplate = (rowData) => (

  <div className="accionesBotones">
    <Button
      icon="pi pi-check"
      className="btn-accion btn-ver"
      tooltip="Habilitar usuario"
      tooltipOptions={{ position: 'left' }}
      onClick={() =>
        Swal.fire({
          title: '¿Habilitar usuario?',
          text: '¿Estás seguro de habilitar este usuario?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, habilitar',
          cancelButtonText: 'Cancelar',
          customClass: {
            popup: 'mi-popup',
            title: 'mi-titulo',
            confirmButton: 'mi-boton-confirmar',
            cancelButton: 'mi-boton-cancelar'
          }
        }).then(result => {
          if (result.isConfirmed) {
            enableUser(rowData.id).then(() => {
              setUsers(prev => prev.filter(user => user.id !== rowData.id));
            });
          }
        })
      }
    />
    <Button
      icon="pi pi-trash"
      className="btn-accion btn-pdf"
      tooltip="Eliminar usuario"
      tooltipOptions={{ position: 'left' }}
      onClick={() =>
        Swal.fire({
          title: '¿Eliminar usuario?',
          text: 'Esta acción no se puede deshacer',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
          customClass: {
            popup: 'mi-popup',
            title: 'mi-titulo',
            confirmButton: 'mi-boton-confirmar',
            cancelButton: 'mi-boton-cancelar'
          }
        }).then(result => {
          if (result.isConfirmed) deleteUser(rowData.id);
        })
      }
    />
  </div>
);


    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center" style={{ height: '60px' }}>
                <ProgressSpinner style={{ width: '40px', height: '40px' }} />
            </div>
        );
    }

    return (
        <div className='p-4' id='disabled'>
            <h2 className='text-2xl font-bold mb-4'>Usuarios Deshabilitados</h2>
            {users.length > 0 ? (
                <DataTable
                    value={users}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    tableStyle={{ minWidth: '50rem' }}
                    rowClassName={(rowData) => {
                        const index = users.findIndex(u => u.id === rowData.id);
                        return index % 2 === 0 ? 'fila-par' : 'fila-impar';
                    }}
                    >
                    <Column field='email' header='Email' sortable />
                    <Column field='role' header='Rol' sortable />
                    <Column field='name' header='Nombre' sortable />
                    <Column 
                        header="Acciones" 
                        body={actionTemplate} 
                        style={{ width: '150px' }}
                    />
                </DataTable>

            ) : (
                <p>No hay usuarios deshabilitados</p>
            )}
        </div>
    );
};

export default Disabled;
