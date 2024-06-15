document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'http://127.0.0.1:8000/';

    document.getElementById('loginForm')?.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        axios.post(`${apiUrl}/login/`, { username, password })
            .then(response => {
                localStorage.setItem('token', response.data.token);
                window.location.href = 'index.html';
            })
            .catch(error => {
                document.getElementById('loginError').textContent = 'Invalid credentials';
                document.getElementById('loginError').style.display = 'block';
            });
    });


    document.getElementById('registerForm')?.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        axios.post(`${apiUrl}/register/`, { username, email, password })
            .then(response => {
                localStorage.setItem('token', response.data.token);
                window.location.href = 'index.html';
            })
            .catch(error => {
                document.getElementById('registerError').textContent = 'Failed to register';
                document.getElementById('registerError').style.display = 'block';
            });
    });

    document.getElementById('hermiteForm')?.addEventListener('submit', function(event) {
        event.preventDefault();
        const x_values = document.getElementById('x_values').value.split(',').map(Number);
        const y_values = document.getElementById('y_values').value.split(',').map(Number);
        const derivatives = document.getElementById('derivatives').value.split(',').map(Number);

        axios.post(`${apiUrl}/metodos/hermite/`, { x_values, y_values, derivatives })
            .then(response => {
                document.getElementById('hermiteResult').textContent = JSON.stringify(response.data);
                const exampleModal = new bootstrap.Modal(document.getElementById('exampleModal'));
                exampleModal.show();
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    });

    // Runge-Kutta Method
    document.getElementById('rungeKuttaForm')?.addEventListener('submit', function(event) {
        event.preventDefault();
        const func = document.getElementById('function').value;
        const initialValue = parseFloat(document.getElementById('initialValue').value);
        const startTime = parseFloat(document.getElementById('startTime').value);
        const endTime = parseFloat(document.getElementById('endTime').value);
        const stepSize = parseFloat(document.getElementById('stepSize').value);

        axios.post(`${apiUrl}/metodos/runge_kutta/`, { function: func, initialValue, startTime, endTime, stepSize })
            .then(response => {
                document.getElementById('rungeKuttaResult').textContent = JSON.stringify(response.data.result);
                const exampleModal = new bootstrap.Modal(document.getElementById('exampleModal'));
                exampleModal.show();
            });
    });

    if (window.location.pathname.endsWith('history.html')) {
        const token = localStorage.getItem('token');
        
        if (token) {
            axios.get(`${apiUrl}/metodos/get_history/`, {
                headers: { 'Authorization': `Token ${token}` }
            })
            .then(response => {
                let historyHtml = '';
                response.data.forEach(item => {
                    const formattedDate = moment(item.timestamp).format('YYYY-MM-DD HH:mm:ss');
        
                    const formattedResult = JSON.stringify(item.result, null, 2);
                    
                    historyHtml += `<div>
                        <strong>Método:</strong> ${item.method} <br> 
                        <strong>Entrada:</strong> ${JSON.stringify(item.input_data, null, 2)} <br> 
                        <strong>Resultado:</strong> <pre>${formattedResult}</pre> <br> 
                        <strong>Fecha:</strong> ${formattedDate}
                    </div><hr>`;
                });
                document.getElementById('historyList').innerHTML = historyHtml;
            })
            .catch(error => {
                console.error('Error al obtener el historial:', error);
            });
        } else {
            document.getElementById('historyList').textContent = 'Inicia sesión para ver tu historial';
        }
    }
    

    document.getElementById('GuardaCambios').addEventListener('click',function(){
        const token = localStorage.getItem('token');
        

        
        if(token){
            if(document.getElementById('x_values'), document.getElementById('y_values'), document.getElementById('derivatives')){
                const x_values = document.getElementById('x_values').value.split(',').map(Number);
                const y_values = document.getElementById('y_values').value.split(',').map(Number);
                const derivatives = document.getElementById('derivatives').value.split(',').map(Number);
                const result1 = document.getElementById('hermiteResult').textContent;
                axios.post(`${apiUrl}/metodos/save_history/`,{
                    method: "hermite",
                    input_data: {
                        x_values: x_values,
                        y_values: y_values,
                        derivatives: derivatives
                    },
                    result: result1
                }, {
                    headers: { 'Authorization': `Token ${token}` }
                }).then(response => {
                    const exampleModal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
                    exampleModal.hide();
                }).catch(error => {
                    console.error('Error al guardar los cambios:', error);
                });
            }
            else
            {
                const func = document.getElementById('function').value;
                const initialValue = parseFloat(document.getElementById('initialValue').value);
                const startTime = parseFloat(document.getElementById('startTime').value);
                const endTime = parseFloat(document.getElementById('endTime').value);
                const stepSize = parseFloat(document.getElementById('stepSize').value);
                const result2 = document.getElementById('rungeKuttaResult').textContent;
                
                axios.post(`${apiUrl}/metodos/save_history/`, { method: "runge_kutta", input_data:{function: func, initialValue, startTime, endTime, stepSize}, result: result2 }, {
                    headers: { 'Authorization': `Token ${token}` }}).then(response => {
                        const exampleModal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
                        exampleModal.hide();
                    }).catch(error => {
                        console.error('Error al guardar los cambios:', error);
                    });
            }
        }
    });
});