document.addEventListener('DOMContentLoaded', function(){
    token = localStorage.getItem("token");
    if(token){
        const mostrar = document.querySelectorAll(".mostrar");
        const Ocultar = document.querySelectorAll(".ocultar");
        Ocultar.forEach(function(elemento) {
            elemento.remove();
        });

    }else{
        const mostrar = document.querySelectorAll(".mostrar");
        mostrar.forEach(function(elemento) {
            elemento.remove();
        });
    }
});

document.getElementById('logoutButton').addEventListener('click', function() {
    localStorage.removeItem('token');
    window.location.href = '../index.html';
});