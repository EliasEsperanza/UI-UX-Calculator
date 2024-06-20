document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'http://127.0.0.1:8000/';
    const token = localStorage.getItem('token');

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

        const headers = token ? { 'Authorization': `Token ${token}` } : {};

        axios.post(`${apiUrl}/metodos/hermite/`, { x_values, y_values, derivatives }, { headers })
            .then(response => {
                const resultDiv = document.getElementById('hermiteResult');
                resultDiv.innerHTML = `
                    <h5>Puntos de interpolación (z):</h5>
                    <p>${response.data["Puntos de interpolacion (z)"].join(', ')}</p>
                    <h5>Tabla de diferencias divididas (q):</h5>
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                ${Object.keys(response.data["Tabla de diferencias divididas (q)"][0]).map(q => `<th>${q}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${response.data["Tabla de diferencias divididas (q)"].map(row => `
                                <tr>
                                    ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;

                if (response.data["Pasos del calculo"]) {
                    resultDiv.innerHTML += `
                        <h5>Pasos del cálculo:</h5>
                        <ul>
                            ${response.data["Pasos del calculo"].map(step => `<li>${step}</li>`).join('')}
                        </ul>
                    `;
                }

                // Show plot if user is authenticated
                if (response.data.plot_data) {
                    const plotData = response.data.plot_data;
                    const ctx = document.getElementById('hermiteChart').getContext('2d');
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: plotData.x,
                            datasets: [{
                                label: 'Hermite Interpolation',
                                data: plotData.y,
                                borderColor: 'rgba(75, 192, 192, 1)',
                                borderWidth: 1,
                                fill: false
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                x: {
                                    type: 'linear',
                                    position: 'bottom'
                                }
                            }
                        }
                    });
                    document.getElementById('hermiteChart').style.display = 'block';
                }

                const exampleModal = new bootstrap.Modal(document.getElementById('exampleModal'));
                exampleModal.show();
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    });

    document.getElementById('rungeKuttaForm')?.addEventListener('submit', function(event) {
        event.preventDefault();
        const func = document.getElementById('function').value;
        const initialValue = parseFloat(document.getElementById('initialValue').value);
        const startTime = parseFloat(document.getElementById('startTime').value);
        const endTime = parseFloat(document.getElementById('endTime').value);
        const stepSize = parseFloat(document.getElementById('stepSize').value);

        const headers = token ? { 'Authorization': `Token ${token}` } : {};

        axios.post(`${apiUrl}/metodos/runge_kutta/`, { function: func, initialValue, startTime, endTime, stepSize }, { headers })
            .then(response => {
                const resultDiv = document.getElementById('rungeKuttaResult');
                resultDiv.innerHTML = `
                    <h5>Resultados:</h5>
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>x</th>
                                <th>y</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${response.data.result.map(point => `
                                <tr>
                                    <td>${point.x}</td>
                                    <td>${point.y}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;

                if (response.data.steps) {
                    resultDiv.innerHTML += `
                        <h5>Pasos del cálculo:</h5>
                        <ul>
                            ${response.data.steps.map(step => `<li>${step}</li>`).join('')}
                        </ul>
                    `;
                }

                // Show plot if user is authenticated
                if (response.data.plot_data) {
                    const plotData = response.data.plot_data;
                    const ctx = document.getElementById('rungeKuttaChart').getContext('2d');
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: plotData.x,
                            datasets: [{
                                label: 'Runge-Kutta',
                                data: plotData.y,
                                borderColor: 'rgba(75, 192, 192, 1)',
                                borderWidth: 1,
                                fill: false
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                x: {
                                    type: 'linear',
                                    position: 'bottom'
                                }
                            }
                        }
                    });
                    document.getElementById('rungeKuttaChart').style.display = 'block';
                }

                const exampleModal = new bootstrap.Modal(document.getElementById('exampleModal'));
                exampleModal.show();
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    });

    if (window.location.pathname.endsWith('history.html')) {
        if (token) {
            axios.get(`${apiUrl}/metodos/get_history/`, {
                headers: { 'Authorization': `Token ${token}` }
            })
            .then(response => {
                let historyHtml = '';
                response.data.forEach(item => {
                    const formattedDate = moment(item.timestamp).format('YYYY-MM-DD HH:mm:ss');
                    const formattedInput = JSON.stringify(item.input_data, null, 2)
                        .replace(/\\n/g, '\n')
                        .replace(/\\"/g, '"');

                    const formattedResult = item.result
                        .replace(/\\n/g, '\n')
                        .replace(/\\"/g, '"')
                        .replace(/ {4,}/g, '') // Remove excessive spaces
                        .trim();

                    historyHtml += `
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">${item.method}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">Fecha: ${formattedDate}</h6>
                            <p class="card-text"><strong>Entrada:</strong></p>
                            <p>${formattedInput}</p>
                            <p class="card-text"><strong>Resultado:</strong></p>
                            <pre>${formattedResult}</pre>
                        </div>
                    </div>`;
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

    document.getElementById('GuardaCambios').addEventListener('click', function() {
        if (token) {
            if (document.getElementById('x_values') && document.getElementById('y_values') && document.getElementById('derivatives')) {
                const x_values = document.getElementById('x_values').value.split(',').map(Number);
                const y_values = document.getElementById('y_values').value.split(',').map(Number);
                const derivatives = document.getElementById('derivatives').value.split(',').map(Number);
                const result1 = document.getElementById('hermiteResult').innerHTML;

                axios.post(`${apiUrl}/metodos/save_history/`, {
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
            } else {
                const func = document.getElementById('function').value;
                const initialValue = parseFloat(document.getElementById('initialValue').value);
                const startTime = parseFloat(document.getElementById('startTime').value);
                const endTime = parseFloat(document.getElementById('endTime').value);
                const stepSize = parseFloat(document.getElementById('stepSize').value);
                const result2 = document.getElementById('rungeKuttaResult').innerHTML;

                axios.post(`${apiUrl}/metodos/save_history/`, {
                    method: "runge_kutta",
                    input_data: {
                        function: func,
                        initialValue: initialValue,
                        startTime: startTime,
                        endTime: endTime,
                        stepSize: stepSize
                    },
                    result: result2
                }, {
                    headers: { 'Authorization': `Token ${token}` }
                }).then(response => {
                    const exampleModal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
                    exampleModal.hide();
                }).catch(error => {
                    console.error('Error al guardar los cambios:', error);
                });
            }
        }
    });
});