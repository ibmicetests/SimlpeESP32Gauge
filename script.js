let ws;
let chart;
let numberChart;
let gauges = [];

// Initialize WebSocket connection
function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        updateGauges(data);
        updateCharts(data);
    };

    ws.onopen = () => {
        console.log('Connected to server');
    };

    ws.onclose = () => {
        console.log('Disconnected from server');
        setTimeout(initWebSocket, 3000);
    };
}

// Initialize gauges
function initGauges() {
    for (let i = 1; i <= 3; i++) {
        const gauge = new Gauge(document.getElementById(`gauge${i}`)).setOptions({
            angle: 0.15,
            lineWidth: 0.44,
            radiusScale: 1,
            pointer: {
                length: 0.6,
                strokeWidth: 0.035,
                color: '#000000'
            },
            limitMax: false,
            limitMin: false,
            colorStart: '#6FADCF',
            colorStop: '#8FC0DA',
            strokeColor: '#E0E0E0',
            generateGradient: true,
            highDpiSupport: true,
            maxValue: 100
        });
        gauge.setMinValue(0);
        gauge.animationSpeed = 32;
        gauges.push(gauge);
    }
}

function initChart() {
    const lineCtx = document.getElementById('sensorChart').getContext('2d');
    const numberCtx = document.getElementById('numberChart').getContext('2d');
    
    // Line chart
    chart = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Sensor 1',
                data: [],
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }, {
                label: 'Sensor 2',
                data: [],
                borderColor: 'rgb(54, 162, 235)',
                tension: 0.1
            }, {
                label: 'Sensor 3',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Number display chart
    numberChart = new Chart(numberCtx, {
        type: 'bar',
        data: {
            labels: ['Sensor 1', 'Sensor 2', 'Sensor 3'],
            datasets: [{
                label: 'Current Values',
                data: [0, 0, 0],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(75, 192, 192, 0.5)'
                ],
                borderColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(75, 192, 192)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateGauges(data) {
    gauges[0].set(data.sensor1);
    gauges[1].set(data.sensor2);
    gauges[2].set(data.sensor3);
}

function updateCharts(data) {
    // Update line chart
    const timestamp = new Date().toLocaleTimeString();
    
    chart.data.labels.push(timestamp);
    chart.data.datasets[0].data.push(data.sensor1);
    chart.data.datasets[1].data.push(data.sensor2);
    chart.data.datasets[2].data.push(data.sensor3);
    
    if (chart.data.labels.length > 20) {
        chart.data.labels.shift();
        chart.data.datasets.forEach(dataset => dataset.data.shift());
    }
    
    chart.update();

    // Update number chart
    numberChart.data.datasets[0].data = [data.sensor1, data.sensor2, data.sensor3];
    numberChart.update();
}

function sendMessage() {
    const message = document.getElementById('messageInput').value;
    const interval = document.getElementById('intervalInput').value;
    
    // Validate interval
    if (interval < 1 || interval > 3600) {
        alert('Interval must be between 1 and 3600 seconds');
        return;
    }

    // Send both message and interval
    const data = {
        message: message,
        interval: parseInt(interval)
    };
    
    ws.send(JSON.stringify(data));
    document.getElementById('messageInput').value = '';
}

// Initialize everything
window.onload = () => {
    initWebSocket();
    initGauges();
    initChart();
};
