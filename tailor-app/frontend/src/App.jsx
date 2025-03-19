import React, { useState, useEffect } from 'react';

// Assets and styling
import { getBackendUrl } from './utils/env';
import tailorLogo from './assets/tailor-white-logo.png'
import './App.css'

// Components
import Chat from './components/Chat'
import PromptInput from './components/PromptInput'
import Footer from './components/Footer'




function App() {
  // temporary for checking backend and frontend integration
  const [healthStatus, setHealthStatus] = useState(null);
  const API_URL = getBackendUrl();
  
  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(response => response.json()) 
      .then(data => {
        setHealthStatus(data.status); 
      })
      .catch(error => {
        console.error("Error fetching health check:", error); 
      });
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <div className="mb-8">
        <img src={tailorLogo} className="mx-auto" alt="Tailor logo" />
      </div>
      <PromptInput/>
           
      {/* <div className="mt-8">
        <Chat />
      </div> */}

      <Footer></Footer>
      
    </div>
  )
}

export default App