document.addEventListener('DOMContentLoaded', function(){
    token = localStorage.getItem("token");
    if(token){
        const Ocultar = document.querySelectorAll(".ocultar");
        Ocultar.forEach(function(elemento) {
            elemento.remove();
        });
    }
});