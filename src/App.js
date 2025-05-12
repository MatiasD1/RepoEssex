import React, { useRef, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Administrator from './components/Administrator';
import Footer from './components/Footer';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase'; 
import { doc, getDoc } from 'firebase/firestore';
import './CSS/styles.css';
import { PrimeReactProvider } from 'primereact/api'; 
import { Toast } from 'primereact/toast';
import NewContract from './components/NewContract';
import ContractsList from './components/ContractsList';
import Navbar from './components/Navbar';
import Reports from './components/Reports';
import Sellers from './components/Sellers';
import ContractsListAdmin from './components/ContractsListAdmin';
import Profile from './components/Profile';

const App = () => {
  const [userRole,setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const toast = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        setCurrentUser(userData);
        const role = userDoc.exists() ? userDoc.data().role : null;
        setUserRole(role);

      } else {
        setUserRole(null);
        setIsAuthenticated(false);
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
        {isAuthenticated && <Navbar user={currentUser}/>}
        <Routes>
          
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={userRole ? <Navigate to={`/${userRole}`} /> : <Login />} />
          <Route path="/register" element={userRole ? <Navigate to={`/${userRole}`} /> : <Register />} />
          <Route path="/profile" element={<Profile/>} />

          <Route path="/administrator" element={userRole === "administrator" ? <Administrator /> : <Navigate to="/" />} />
          <Route path="/administrator/contractsListAdmin" element={userRole === "administrator" ? <ContractsListAdmin /> : <Navigate to="/" />} />
          <Route path="/administrator/reports" element={userRole === "administrator" ? <Reports /> : <Navigate to="/" />} />

          <Route path="/sellers" element={userRole === "sellers" ? <Sellers /> : <Navigate to="/" />} />
          <Route path="/sellers/new" element={userRole === "sellers" ? <NewContract /> : <Navigate to="/" />} />
          <Route path="/sellers/contractsList" element={userRole === "sellers" ? <ContractsList /> : <Navigate to="/" />} />

        </Routes>
        <Footer/>
      </Router>
    </PrimeReactProvider>
  );
};

export default App;
