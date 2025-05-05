import React,{useState,useEffect} from 'react'
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';

const ContractsList = () => {
  
  const [contracts, setContracts] = useState(null);
  const [loading, setLoading] = useState(true);
  const columns = [
    { field: 'userUID', header: 'UID' },
    { field: 'título', header: 'Título' },
    { field: 'createdAt', header: 'Fecha de creación',
      body: (rowData) => {
        if (rowData.createdAt?.toDate) {
          return rowData.createdAt.toDate().toLocaleDateString();
        } else if (rowData.createdAt?.seconds) {
          return new Date(rowData.createdAt.seconds * 1000).toLocaleDateString();
        }
        return 'Fecha no disponible';
      }
     },
    { field: 'contenido', header: 'Contenido' },
    { field: 'pdfUrl', header: 'Pdf' },
    { field: 'estado', header: 'Estado' }
  ]

  useEffect(() => {
    const getContracts = async () => {
      try {
        const contractsRef = collection(db, "contracts");
        const contractsSnapshot = await getDocs(contractsRef);
        const contractsList = contractsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setContracts(contractsList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching contracts:", error);
        setLoading(false);
      } 
    }
    getContracts();
  } , []);


  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ height: '60px' }}>
        <ProgressSpinner style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  return (
    <div>
      <DataTable
        value={contracts}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25]}
        tableStyle={{ minWidth: '50rem' }}
        emptyMessage="No se encontraron contratos."
      >
        {columns.map((col) => (
          <Column
            key={col.field || col.header}
            field={col.field}
            header={col.header}
            sortable
            body={col.body}
          />
        ))}
      </DataTable>
    </div>
  )
}

export default ContractsList;
