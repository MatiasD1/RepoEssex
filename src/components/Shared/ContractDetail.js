import React from 'react';
import { Fieldset, Divider } from 'primereact';

const ContractDetail = ({ contract }) => {
  
  const formatDate = (dateValue) => {
  if (!dateValue) return 'No especificada';
  let date;
  if (dateValue.toDate) {
    date = dateValue.toDate();
  } 
  else {
    date = new Date(dateValue);
  }
  return isNaN(date) ? 'Fecha inválida' : date.toLocaleDateString('es-ES');
};


  return (
    <div>
      <Fieldset legend="Partes Contratantes" className="mb-4">
        <div className="grid">
          <div className="col-12 md:col-4">
            <p><strong>Nombre:</strong> {contract.nombre}</p>
          </div>
          <div className="col-12 md:col-4">
            <p><strong>Apellido:</strong> {contract.apellido}</p>
          </div>
          <div className="col-12 md:col-4">
            <p><strong>DNI:</strong> {contract.dni}</p>
          </div>
        </div>
      </Fieldset>

      <Divider />

      <Fieldset legend="Datos del Contrato" className="mb-4">
        <div className="grid">
          <div className="col-12 md:col-6">
            <p><strong>Fecha de Inicio:</strong> {formatDate(contract.fechaInicio)}</p>
          </div>
          <div className="col-12 md:col-6">
            <p><strong>Fecha de Fin:</strong> {formatDate(contract.fechaFin)}</p>
          </div>
          <div className="col-12">
            <p><strong>Monto Mensual:</strong> ${contract.monto} USD</p>
            {contract.incluyePenalizacion && (
              <p><strong>Incluye penalización por mora</strong></p>
            )}
          </div>
        </div>
      </Fieldset>

      <Divider />

      <Fieldset legend="Cláusulas" className="mb-4">
        <div 
          dangerouslySetInnerHTML={{ __html: contract.contenido }} 
          className="prose"
        />
      </Fieldset>

      <Divider />

      <Fieldset legend="Firmas" className="mb-4">
        <div className="flex flex-column md:flex-row justify-content-between gap-4" style={{maxWidth: '460px', margin: '0 auto'}}>
          <div className="flex flex-column align-items-center" >
            <label className="block mb-2">Firma del Cliente</label>
            {contract.firmaUsuario ? (
              <img 
                src={contract.firmaUsuario} 
                alt="Firma" 
                style={{ width: '180px', height: '70px', border: '1px solid #ccc',backgroundColor:'white' }} 
              />
            ) : (
              <div style={{ width: '180px', height: '70px', border: '1px dashed #ccc' }} className="flex align-items-center justify-content-center">
                <span>Sin firma registrada</span>
              </div>
            )}
            <p className="mt-2"style={{ fontSize: '0.9rem', textAlign: 'center' }}>
              {contract.nombre} {contract.apellido}
              <br />
              DNI: {contract.dni}
            </p>
          </div>
          
          <div className="flex flex-column align-items-center">
            <label className="block mb-2">Firma del Representante</label>
            <p className="mt-2">
              {contract.nombreEmpresa || 'Representante'}
              <img 
                src={contract.firmaVendedor} 
                alt="Firma" 
                style={{ width: '180px', height: '70px', border: '1px solid #ccc',backgroundColor:'white' }} 
              />
            </p>
          </div>
        </div>
      </Fieldset>
    </div>
  );
};

export default ContractDetail;