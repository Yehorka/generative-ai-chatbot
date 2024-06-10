const getBackendUrl = () => {
    const { protocol, hostname } = window.location;
    const backendPort = process.env.REACT_APP_BACKEND_PORT || 8090; 
    return `${protocol}//${hostname}:${backendPort}`;
  };
  
  export const API_URL = getBackendUrl();