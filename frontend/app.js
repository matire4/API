async function consultarCaso(caso) {
    const respuesta = await fetch(`http://localhost:3001/${caso}`);
    const data = await respuesta.json();
  
    document.getElementById("resultado").innerText = JSON.stringify(data, null, 2);
  }
  