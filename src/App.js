import React, { useRef, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Administrador from './components/Administrador';
import Vendedor from './components/Vendedor';
import Footer from './components/Footer';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase'; 
import { doc, getDoc } from 'firebase/firestore';
import './CSS/styles.css';
import { PrimeReactProvider } from 'primereact/api'; 
import { Toast } from 'primereact/toast';
import NewContracts from './components/NewContrats';

const App = () => {
  const  [userRole,setUserRole] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const toast = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const role = userDoc.exists() ? userDoc.data().role : null;
        setUserRole(role);

      } else {
        setUserRole(null);
      }
      setLoading(false); 
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <PrimeReactProvider>
      <Toast ref={toast} />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={userRole ? <Navigate to={`/${userRole}`} /> : <Login />} />
          <Route path="/register" element={userRole ? <Navigate to={`/${userRole}`} /> : <Register />} />
          <Route path="/administrador" element={userRole === "administrador" ? <Administrador /> : <Navigate to="/" />} />
          <Route path="/vendedor" element={userRole === "vendedor" ? <Vendedor /> : <Navigate to="/" />} />
          <Route path="/vendedor/new" element={userRole === "vendedor" ? <NewContracts /> : <Navigate to="/" />} />
        </Routes>
        <Footer/>
      </Router>
    </PrimeReactProvider>
  );
};

export default App;
