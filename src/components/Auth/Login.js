import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { Password } from 'primereact/password';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userRef);
      setUser(userDoc.data());
      
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const footer = (
    <div className="p-text-center">
      <Divider />
      <p className="p-text-secondary">¿No tienes cuenta? <a href="/register" className="p-text-primary">Regístrate</a></p>
    </div>
  );

  return (
    <div className="login-container">
  <Card title="Iniciar Sesión" footer={footer} className="login-card">
        <form onSubmit={handleLogin}>
          <div className="p-field">
            <label htmlFor="email" className="p-d-block">Email</label>
            <InputText
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-mb-3 p-d-block"
              style={{ width: '100%' }}
              placeholder="tu@email.com"
            />
          </div>
          
          <div className="p-field">
            <label htmlFor="password" className="p-d-block">Contraseña</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              feedback={false}
              toggleMask
              className="p-mb-3 p-d-block"
              style={{ width: '100%' }}
              placeholder="Ingresa tu contraseña"
            />
          </div>
  
          {error && <Message severity="error" text={error} className="p-mb-3" />}
  
          <Button 
            label="Ingresar" 
            type="submit" 
            icon="pi pi-sign-in" 
            className="p-button-raised p-button-primary p-d-block"
            style={{ width: '100%' }}
          />
        </form>
      </Card>
    </div>
  );
};

export default Login;