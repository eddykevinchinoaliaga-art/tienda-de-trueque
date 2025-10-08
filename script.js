const btnRegistro = document.getElementById("btnRegistro");
const btnPublicar = document.getElementById("btnPublicar");
const btnReporte = document.getElementById("btnReporte");

const modalRegistro = document.getElementById("modalRegistro");
const modalPublicar = document.getElementById("modalPublicar");
const modalIntercambio = document.getElementById("modalIntercambio");
const modalReporteCuenta = document.getElementById("modalReporteCuenta");

[modalRegistro, modalPublicar, modalIntercambio, modalReporteCuenta].forEach(m => m.style.display = "none");

btnRegistro.addEventListener("click", ()=> modalRegistro.style.display="flex");
btnPublicar.addEventListener("click", ()=> modalPublicar.style.display="flex");
btnReporte.addEventListener("click", ()=> modalReporteCuenta.style.display="flex");

document.getElementById("closeRegistro").onclick = ()=> modalRegistro.style.display="none";
document.getElementById("closePublicar").onclick = ()=> modalPublicar.style.display="none";
document.getElementById("closeModal").onclick = ()=> modalIntercambio.style.display="none";
document.getElementById("closeReporteCuenta").onclick = ()=> modalReporteCuenta.style.display="none";

window.onclick = (e) => {
  if([modalRegistro, modalPublicar, modalIntercambio, modalReporteCuenta].includes(e.target)){
    e.target.style.display = "none";
  }
}


let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

function mostrarUsuarioHeader(usuario){
  const header = document.getElementById("usuarioHeader");
  document.getElementById("nombreHeader").textContent = usuario.username;
  document.getElementById("fotoPerfilHeader").src = usuario.fotoPerfil;
  header.style.display = "flex";
  document.querySelector(".menu-buttons").style.display = "flex";
}

if(usuarioActivo) mostrarUsuarioHeader(usuarioActivo);

const registroForm = document.getElementById("registroForm");
const registroMensaje = document.getElementById("registroMensaje");

registroForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const password = document.getElementById("password").value;
  const carnet = document.getElementById("carnet").value.trim();
  const fotoPerfilFile = document.getElementById("fotoPerfil").files[0];

  function crearUsuario(fotoPerfil){
    const nuevoUsuario = {username, telefono, password, carnet, fotoPerfil};
    const indexExistente = usuarios.findIndex(u => u.telefono === telefono);
    if(indexExistente !== -1){
      usuarios[indexExistente] = nuevoUsuario;
    } else {
      usuarios.push(nuevoUsuario);
    }
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("usuarioActivo", JSON.stringify(nuevoUsuario));
    mostrarUsuarioHeader(nuevoUsuario);

    registroMensaje.textContent = "Registro exitoso!";
    registroMensaje.style.color = "green";
    registroForm.reset();
    modalRegistro.style.display = "none";
    modalPublicar.style.display = "flex";
  }

  if(fotoPerfilFile){
    const reader = new FileReader();
    reader.onload = function(ev){
      crearUsuario(ev.target.result);
    }
    reader.readAsDataURL(fotoPerfilFile);
  } else {
    crearUsuario("https://via.placeholder.com/150");
  }
});

document.getElementById("btnCerrarSesion").addEventListener("click", ()=>{
  localStorage.removeItem("usuarioActivo");
  document.getElementById("usuarioHeader").style.display = "none";
});

let articulos = JSON.parse(localStorage.getItem("articulos")) || [];
let articuloSeleccionadoIndex = null;

function mostrarArticulos(){
  const lista = document.getElementById("listaArticulos");
  lista.innerHTML = "";
  articulos.forEach((a,index)=>{
    const card = document.createElement("div");
    card.classList.add("producto");
    card.innerHTML = `
      <img src="${a.imagen}" alt="${a.titulo}">
      <h3>${a.titulo}</h3>
      <p>${a.descripcion}</p>
      <p><strong>Estado:</strong> ${a.estado}</p>
      <p><strong>Categoría:</strong> ${a.catalogo}</p>
      <button class="btn-intercambio">Intercambiar</button>
    `;
    lista.appendChild(card);

    card.querySelector(".btn-intercambio").addEventListener("click", ()=>{
      articuloSeleccionadoIndex = index; 
      modalIntercambio.style.display="flex";
      document.getElementById("telefonoIntercambio").value = a.telefono;
    });
  });
}

let fotosSeleccionadas = [];
document.getElementById("foto").addEventListener("change", (e)=>{
  const preview = document.getElementById("previewFotos");
  preview.innerHTML="";
  fotosSeleccionadas=[];
  [...e.target.files].forEach(file=>{
    const reader = new FileReader();
    reader.onload = function(ev){
      fotosSeleccionadas.push(ev.target.result);
      const img = document.createElement("img");
      img.src = ev.target.result;
      preview.appendChild(img);
    }
    reader.readAsDataURL(file);
  });
});

// Publicar artículo
document.getElementById("articuloForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  const titulo = document.getElementById("titulo").value;
  const descripcion = document.getElementById("descripcion").value;
  const telefono = document.getElementById("telefonoArticulo").value;
  const estado = document.getElementById("estado").value;
  const catalogo = document.getElementById("catalogo").value;
  const imagen = fotosSeleccionadas[0] || "https://via.placeholder.com/200";

  articulos.push({titulo, descripcion, imagen, telefono, estado, catalogo});
  localStorage.setItem("articulos", JSON.stringify(articulos));
  mostrarArticulos();
  document.getElementById("articuloForm").reset();
  document.getElementById("previewFotos").innerHTML="";
  fotosSeleccionadas=[];
  modalPublicar.style.display="none";
});

document.getElementById("intercambioForm").addEventListener("submit",(e)=>{
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const objeto = document.getElementById("objetoIntercambio").value; // <- NUEVO
  const mensaje = document.getElementById("mensaje").value;

  const fecha = new Date();
  const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
  const hora = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const fechaTexto = `${fecha.toLocaleDateString('es-ES', opciones)} a las ${hora}`;

  const textoWhatsApp = ` *Solicitud de intercambio desde TRUEQUE ONLINE*

 *Nombre:* ${nombre}
 *Quiero intercambiar:* ${objeto}
 *Mensaje del usuario:* ${mensaje}
 *Enviado el:* ${fechaTexto}
 *Mensaje generado automáticamente por Trueque Online*`;

  const telefonoPropietario = document.getElementById("telefonoIntercambio").value;
  const url = `https://wa.me/${telefonoPropietario}?text=${encodeURIComponent(textoWhatsApp)}`;
  window.open(url, "_blank");

  alert("Solicitud enviada por WhatsApp. El artículo será eliminado del catálogo.");

  if(articuloSeleccionadoIndex !== null){
    articulos.splice(articuloSeleccionadoIndex,1);
    localStorage.setItem("articulos", JSON.stringify(articulos));
    mostrarArticulos();
    articuloSeleccionadoIndex = null;
  }

  document.getElementById("intercambioForm").reset();
  document.getElementById("previewIntercambio").innerHTML = "";
  modalIntercambio.style.display="none";
});

let fotosReporte = [];
document.getElementById("fotoReporteCuenta").addEventListener("change",(e)=>{
  const preview = document.getElementById("previewReporteCuenta");
  preview.innerHTML = "";
  fotosReporte = [];
  [...e.target.files].forEach(file=>{
    const reader = new FileReader();
    reader.onload = function(ev){
      fotosReporte.push(ev.target.result);
      const img = document.createElement("img");
      img.src = ev.target.result;
      preview.appendChild(img);
    }
    reader.readAsDataURL(file);
  });
});

document.getElementById("reporteCuentaForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  const motivo = document.getElementById("motivoReporteCuenta").value;
  const telefono = document.getElementById("telefonoDenunciado").value;
  const reportarCuenta = document.getElementById("reportarCuenta").checked;

  alert(`Reporte enviado:\nMotivo: ${motivo}\nNúmero denunciado: ${telefono}\nReportar cuenta: ${reportarCuenta ? "Sí" : "No"}`);

  document.getElementById("reporteCuentaForm").reset();
  document.getElementById("previewReporteCuenta").innerHTML="";
  fotosReporte = [];
  modalReporteCuenta.style.display="none";
});

mostrarArticulos();
