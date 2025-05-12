import  { useState,useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatDate } from './FirebaseContrats';


const ContractsListAdmin = () => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useRef(null);
    const columns = [
        {field: 'titulo', header: 'Título'},
        {field: 'contenido', header: 'Contenido'},
        {field: 'createdAt', header: 'Fecha Creación'},
        {field: 'status', header: 'Estado'}
    ];


    const showError = (message) => {
        toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: message,
            life: 5000
        });
    };

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const docCollectionRef = collection(db, "contracts");
                const ColData = await getDocs(docCollectionRef);
                const contractsData = ColData.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: formatDate(data.createdAt),
                        fechaInicio: formatDate(data.fechaInicio),
                        fechaFin: formatDate(data.fechaFin)
                    };
                });
                setContracts(contractsData);
            } catch (error) {
                console.error("Error fetching contracts:", error);
                showError("No se pudieron cargar los contratos");
            } finally {
                setLoading(false);
            }
        };

        fetchContracts();
    }, []);

    return (
    <div>
        <DataTable
            value={contracts}
            loading={loading}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            header="Lista de Contratos"
            emptyMessage="No se encontraron contratos"
        >
            {columns.map((col) => (
                <Column key={col.field} field={col.field} header={col.header} sortable />
            ))}
        </DataTable>        
    </div>
  )
}


export default ContractsListAdmin;
