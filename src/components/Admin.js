import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists() && docSnap.data()?.role !== 'administrador') {
          navigate('/home', { replace: true }); // Redirige a /home si no es administrador
        }
      } else {
        navigate('/login', { replace: true }); // Redirige a /login si no está autenticado
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <h1>Página de Administrador</h1>
      <p>Contenido exclusivo para administradores</p>
    </div>
  );
};

export default Admin;