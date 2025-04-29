import { Link, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase"; // Asegúrate de que este archivo exporta bien `auth` y `db`
import { doc, getDoc } from "firebase/firestore"; // Importa correctamente `doc` y `getDoc`

const Navbar = ({ user }) => {
  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const location = useLocation();
  
  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setRole(docSnap.data().role);
            }
          } catch (error) {
            console.error("Error al obtener el rol del usuario:", error);
          } finally {
            setLoadingRole(false);
          }
        } else {
          setRole(null);
          setLoadingRole(false);
        }
      };
  
      fetchRole();
    }, [user]);
  
    const handleLogout = async () => {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    };
  
    // No mostrar nada mientras se carga el rol del usuario
    if (loadingRole) return null;
  
    return (
        <nav>
      <Link to="/">Inicio</Link>
      {user ? (
        <>
          {!loadingRole && role === "administrador" && (
            <Link to="/admin">Admin</Link>
          )}
          <button onClick={handleLogout}>Cerrar sesión</button>
        </>
      ) : (
        <>
          {location.pathname !== "/login" && (
            <Link to="/login">Iniciar sesión</Link>
          )}
          {location.pathname !== "/register" && (
            <Link to="/register">Registrarse</Link>
          )}
        </>
      )}
    </nav>
    
    );
  };
  

export default Navbar;