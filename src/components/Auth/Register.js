import { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from '../../firebase';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { Password } from 'primereact/password';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');



 

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
      email: email,

      role: "sellers", // Asigno el rol seller automáticamente
      nombre: nombre,
      apellido: apellido,
      status: "active",
      visible: true
    });
        

    } catch (err) {
      setError(err.message);
    }
  };

  const footer = (
    <div className="p-text-center">
      <Divider />
      <p className="p-text-secondary">¿Ya tienes cuenta? <a href="/login" className="p-text-primary">Inicia sesión</a></p>
    </div>
  );

  return (
    <div className="register-wrapper">
      <Card title="Registro" footer={footer} className="register-card">
        <form onSubmit={handleRegister}>
          <div className="p-field">
            <label htmlFor="email">Correo Electrónico</label>
            <InputText
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="p-field">
            <label htmlFor="password">Contraseña</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
              placeholder="Crea una contraseña"
              required
            />
          </div>

          <div className="p-field">
            <label htmlFor="nombre">Nombre</label>
            <InputText
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              required
            />
          </div>

          <div className="p-field">
            <label htmlFor="apellido">Apellido</label>
            <InputText
              id="apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder="Tu apellido"
              required
            />
          </div>

          {error && <Message severity="error" text={error} />}

          <Button 
            label="Registrarse" 
            type="submit" 
            icon="pi pi-user-plus" 
            className="p-button-raised p-button-success BotonRL"
          />
        </form>
      </Card>
    </div>
  );

};

export default Register;