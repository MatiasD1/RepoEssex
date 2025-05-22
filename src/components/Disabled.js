import { useEffect, useState } from 'react';
import { onSnapshot} from 'firebase/firestore';
import { deleteUser, enableUser, getDisabledUsers, showError } from './FirebaseSellers';
import { ProgressSpinner } from 'primereact/progressspinner';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

const Disabled = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDisabledUsers()
        .then(q => {
            const unsubscribe = onSnapshot(q,(snapshot) => {
                const usersData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUsers(usersData);
                setLoading(false);
            },
            (error) => {
                showError(error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    })
    .catch(error => {
      showError(error);
      setLoading(false);
    });
}, []);

    const actionTemplate = (rowData) => (
        <div className="flex gap-2">
            <Button
                icon="pi pi-check"
                severity='success'
                tooltip="Habilitar usuario"
                onClick={() => enableUser(rowData.id)}
            />
            <Button
                icon="pi pi-trash"
                severity="danger"
                tooltip="Eliminar usuario"
                onClick={() => deleteUser(rowData.id)}
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
        <div className='p-4'>
            <h1 className='text-2xl font-bold mb-4'>Usuarios Deshabilitados</h1>
            {users.length > 0 ? (
                <DataTable
                    value={users}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    tableStyle={{ minWidth: '50rem' }}
                >
                    <Column field='email' header='Email' sortable />
                    <Column field='role' header='Rol' sortable />
                    <Column field='name' header='Nombre' sortable />
                    <Column 
                        header='Acciones' 
                        body={actionTemplate}
                        style={{ width: '150px' }}
                    />
                </DataTable>
            ) : (
                <p>No hay usuarios deshabilitados</p>
            )}
        </div>
    );
}

export default Disabled;