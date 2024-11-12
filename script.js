let ws;
let chart;
let gauges = [];

// Initialize WebSocket connection
function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        updateGauges(data);
        updateChart(data);
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

// Initialize chart
function initChart() {
    const ctx = document.getElementById('sensorChart').getContext('2d');
    chart = new Chart(ctx, {
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
}

function updateGauges(data) {
    gauges[0].set(data.sensor1);
    gauges[1].set(data.sensor2);
    gauges[2].set(data.sensor3);
}

function updateChart(data) {
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
}

function sendMessage() {
    const message = document.getElementById('messageInput').value;
    ws.send(message);
    document.getElementById('messageInput').value = '';
}

// Initialize everything
window.onload = () => {
    initWebSocket();
    initGauges();
    initChart();
}; 