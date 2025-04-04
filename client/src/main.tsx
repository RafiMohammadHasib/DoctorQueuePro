import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set up document title
document.title = "MediQueue - Queue Management System";

// Set up theme metadata
const meta = document.createElement('meta');
meta.name = 'theme-color';
meta.content = '#1976D2';
document.head.appendChild(meta);

// Set up description metadata
const description = document.createElement('meta');
description.name = 'description';
description.content = 'MediQueue - Comprehensive Queue Management System for doctors\' chambers';
document.head.appendChild(description);

// Create the root element and render the app
createRoot(document.getElementById("root")!).render(<App />);
