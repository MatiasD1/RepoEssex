import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Buffer } from 'buffer';

// Agrega esto antes de cualquier otro código
window.Buffer = window.Buffer || Buffer;
const el = document.getElementById("root");
const root = ReactDOM.createRoot(el);
root.render(<App/>);
