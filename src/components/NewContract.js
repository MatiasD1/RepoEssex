import React, { useEffect, useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { createContract } from './FirebaseContrats'; 
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import NavBar from './Navbar'; 

const NewContract = () => {
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '', // Asegúrate de incluir este campo
    firma: ''
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const toast = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Usamos el usuario de auth directamente
    });
    return () => unsubscribe();
  }, []);

  const showError = (message) => {
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      showError("Debes iniciar sesión para crear contratos");
      return;
    }

    setLoading(true);
    try {
      await createContract({
        ...formData
      });
      navigate('/vendedor');
    } catch (error) {
      showError(`Error al crear contrato: ${error.message}`);
      console.error("Detalles del error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      <NavBar/>
      <h2>Nuevo Contrato</h2>
      <form onSubmit={handleSubmit}>
        <div className="p-fluid grid">
          <div className="field col-12">
            <label htmlFor="titulo">Título del Contrato *</label>
            <InputText
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              required
            />
          </div>
          
          <div className="field col-12">
            <label htmlFor="contenido">Contenido *</label>
            <InputText
              id="contenido"
              value={formData.contenido}
              onChange={(e) => setFormData({...formData, contenido: e.target.value})}
              required
            />
          </div>
          
          <div className="field col-12">
            <label htmlFor="firma">Firma</label>
            <InputText
              id="firma"
              value={formData.firma}
              onChange={(e) => setFormData({...formData, firma: e.target.value})}
            />
          </div>
        </div>
        
        <div className="flex justify-content-end gap-2 mt-4">
          <Button 
            label="Cancelar" 
            className="p-button-secondary" 
            onClick={() => navigate('/vendedor')}
            disabled={loading}
          />
          <Button 
            label={loading ? 'Guardando...' : 'Guardar'} 
            type="submit" 
            icon="pi pi-save"
            loading={loading}
          />
        </div>
      </form>
    </div>
  );
};

export default NewContract;