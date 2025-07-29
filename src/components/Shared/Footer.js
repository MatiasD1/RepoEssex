import React from 'react';

const Footer = () => {
  return (
    <div className="page-container">
      <footer className="footer">
        <p className="copyright">
          © {new Date().getFullYear()} Desarrollado por B-Logic. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Footer;
