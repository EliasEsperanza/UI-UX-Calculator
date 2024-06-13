document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'http://localhost:3000';

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
                    historyHtml += `<div><strong>Method:</strong> ${item.method} <br> <strong>Input:</strong> ${JSON.stringify(item.input_data)} <br> <strong>Result:</strong> ${JSON.stringify(item.result)} <br> <strong>Timestamp:</strong> ${item.timestamp}</div><hr>`;
                });
                document.getElementById('historyList').innerHTML = historyHtml;
            });
        } else {
            document.getElementById('historyList').textContent = 'Please log in to view your history';
        }
    }
});