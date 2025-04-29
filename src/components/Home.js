import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Home = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setRole(docSnap.data().role);
      }
      setLoading(false);
    };
    fetchRole();
  }, [userId]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Bienvenido, {role === 'administrador' ? 'Administrador' : 'Vendedor'}.</h1>

      {role === 'administrador' ? ( 
        <div>
          <h2>Contenido de admin</h2>
         
        </div>
      ) : (
        <div>
          <h2>Contenido de vendedor</h2>
        </div>
      )}

      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
};

export default Home;
