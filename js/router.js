//Importamos la funcion de render history para poder renderizar el historial de ventas

import { renderHistory } from "./history.js"
//ROUTER BASICO, BUSCAMOS LAS SECCIONES DEL DOM Y SE ASIGNAN A VARIABLES
export function navigate(route) {
    const mainSection = document.querySelector(".main__content-section");
    const heroSection = document.querySelector(".hero__section");
    const cartAside = document.querySelector("#cart");
    const historySection = document.querySelector("#historySection");
    //OCULTAMOS PRIMERO TODO PARA LA VISTA
    heroSection.style.display = "none";
    mainSection.style.display = "none";
    cartAside.style.display = "none";
    historySection.style.display = "none";
    //SI OPRIMIMOS EL BOTON DE HOME EL HERO, EL MAIN Y EL CARRITO SE VAN DESPLEGAR PARA ESTAR A DISPOSICION DEL USUARIO
    if (route === "home") {
        heroSection.style.display = "block";
        mainSection.style.display = "block";
        cartAside.style.display = "block";
    }
    // SI SELECCIONAMOS PROFILE AUTOMATICAMENTE SE DESPLEGARA EL HISTORY SECTION

    if (route === "history") {
        historySection.style.display = "block";
        renderHistory();
    }
    // SI SELECCIONAMOS EL CARRITO SE DESPELGARA EL CARRITO

    if (route === "cart") {
        cartAside.style.display = "block";
    }
}

