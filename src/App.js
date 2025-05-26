import React, { useRef, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Administrator from './components/Administrator/Administrator';
import Footer from './components/Shared/Footer';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './firebase'; 
import { doc, getDoc } from 'firebase/firestore';
import { PrimeReactProvider } from 'primereact/api'; 
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import NewContract from './components/Shared/NewContract';
import ContractsList from './components/Sellers/ContractsList';
import Navbar from './components/Shared/Navbar';
import Reports from './components/Administrator/Reports';
import Sellers from './components/Sellers/Sellers';
import ContractsListAdmin from './components/Administrator/ContractsListAdmin';
import Profile from './components/Shared/Profile';
import './CSS/styles.css';
import 'animate.css';
import { showError } from './components/Administrator/FirebaseSellers';
import Disabled from './components/Administrator/Disabled';

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
        if (userData.status==="disabled"){
          await signOut(auth);
          showError('Tu usuario ha sido deshabilitado, comunicate con un administrador');
          return;
        }
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
    return <div className="flex justify-content-center align-items-center min-h-screen bg-blue-50">
        <ProgressSpinner style={{ width: '60px', height: '60px' }} strokeWidth="4" />
      </div> 
  }

  return (
    <PrimeReactProvider>
      <Toast ref={toast} />
      <Router>
        <div className="appContainer">
        {isAuthenticated && <Navbar user={currentUser}/>}
         <main className="content">
          <Routes>
           
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={userRole ? <Navigate to={`/${userRole}`} /> : <Login />} />
            <Route path="/register" element={userRole ? <Navigate to={`/${userRole}`} /> : <Register />} />
            <Route path="/profile" element={<Profile/>} />

            <Route path="/administrator" element={userRole === "administrator" ? <Administrator /> : <Navigate to="/" />} />
            <Route path="/administrator/contractsListAdmin" element={userRole === "administrator" ? <ContractsListAdmin /> : <Navigate to="/" />} />
            <Route path="/administrator/reports" element={userRole === "administrator" ? <Reports /> : <Navigate to="/" />} />
            <Route path="/administrator/disabled" element={userRole === "administrator"?<Disabled /> : <Navigate to="/" />}/>

            <Route path="/sellers" element={userRole === "sellers" ? <Sellers /> : <Navigate to="/" />} />
            <Route path="/sellers/new" element={userRole === "sellers" ? <NewContract /> : <Navigate to="/" />} />
            <Route path="/sellers/contractsList" element={userRole === "sellers" ? <ContractsList /> : <Navigate to="/" />} />
          
          </Routes>
          </main>
          <Footer/>
        </div>
      </Router>
    </PrimeReactProvider>
  );
};

export default App;
