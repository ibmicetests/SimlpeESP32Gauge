let ws;
let chart;
let numberChart;
let gauges = [];

function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        updateGauges(data);
        updateCharts(data);
        updateValues(data);
    };

    ws.onopen = () => {
        console.log('Connected to server');
        updateConnectionStatus(true);
    };

    ws.onclose = () => {
        console.log('Disconnected from server');
        updateConnectionStatus(false);
        setTimeout(initWebSocket, 3000);
    };
}

function updateConnectionStatus(connected) {
    const statusElement = document.getElementById('connection-status');
    if (connected) {
        statusElement.textContent = 'Connected';
        statusElement.className = 'connection-status status-connected';
    } else {
        statusElement.textContent = 'Disconnected - Reconnecting...';
        statusElement.className = 'connection-status status-disconnected';
    }
}

function initGauges() {
    const gaugeOptions = {
        angle: -0.2,
        lineWidth: 0.2,
        radiusScale: 0.9,
        pointer: {
            length: 0.6,
            strokeWidth: 0.035,
            color: '#000000'
        },
        limitMax: false,
        limitMin: false,
        generateGradient: true,
        highDpiSupport: true,
        staticLabels: {
            font: "12px sans-serif",
            labels: [0, 20, 40, 60, 80, 100],
            color: "#000000",
            fractionDigits: 0
        },
        renderTicks: {
            divisions: 5,
            divWidth: 1.1,
            divLength: 0.7,
            divColor: '#333333',
            subDivisions: 3,
            subLength: 0.5,
            subWidth: 0.6,
            subColor: '#666666'
        }
    };

    // Temperature Gauge
    const gauge1 = new Gauge(document.getElementById('gauge1')).setOptions({
        ...gaugeOptions,
        staticZones: [
            {strokeStyle: "#30B32D", min: 0, max: 30},
            {strokeStyle: "#FFDD00", min: 30, max: 60},
            {strokeStyle: "#F03E3E", min: 60, max: 100}
        ],
        maxValue: 100,
        units: "°C"
    });

    // Humidity Gauge
    const gauge2 = new Gauge(document.getElementById('gauge2')).setOptions({
        ...gaugeOptions,
        staticZones: [
            {strokeStyle: "#30B32D", min: 0, max: 40},
            {strokeStyle: "#FFDD00", min: 40, max: 70},
            {strokeStyle: "#F03E3E", min: 70, max: 100}
        ],
        maxValue: 100,
        units: "%"
    });

    // Battery Level Gauge
    const gauge3 = new Gauge(document.getElementById('gauge3')).setOptions({
        ...gaugeOptions,
        staticZones: [
            {strokeStyle: "#F03E3E", min: 0, max: 20},
            {strokeStyle: "#FFDD00", min: 20, max: 40},
            {strokeStyle: "#30B32D", min: 40, max: 100}
        ],
        maxValue: 100,
        units: "%"
    });

    gauges = [gauge1, gauge2, gauge3];
    gauges.forEach(gauge => {
        gauge.setMinValue(0);
        gauge.animationSpeed = 32;
    });
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
                label: 'Temperature (°C)',
                data: [],
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }, {
                label: 'Humidity (%)',
                data: [],
                borderColor: 'rgb(54, 162, 235)',
                tension: 0.1
            }, {
                label: 'Battery (%)',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            },
            animation: {
                duration: 750
            }
        }
    });

    // Number display chart
    numberChart = new Chart(numberCtx, {
        type: 'bar',
        data: {
            labels: ['Temperature', 'Humidity', 'Battery'],
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
                    beginAtZero: true,
                    max: 100
                }
            },
            animation: {
                duration: 750
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

    numberChart.data.datasets[0].data = [data.sensor1, data.sensor2, data.sensor3];
    numberChart.update();
}

function updateValues(data) {
    document.getElementById('value1').textContent = `${data.sensor1.toFixed(1)}°C`;
    document.getElementById('value2').textContent = `${data.sensor2.toFixed(1)}%`;
    document.getElementById('value3').textContent = `${data.sensor3.toFixed(1)}%`;
}

function sendMessage() {
    const message = document.getElementById('messageInput').value;
    const interval = document.getElementById('intervalInput').value;
    
    if (interval < 1 || interval > 3600) {
        alert('Interval must be between 1 and 3600 seconds');
        return;
    }

    const data = {
        message: message,
        interval: parseInt(interval)
    };
    
    ws.send(JSON.stringify(data));
    document.getElementById('messageInput').value = '';
}

// Initialize everything when the page loads
window.onload = () => {
    initWebSocket();
    initGauges();
    initChart();
};
