const textElement = document.getElementById('currentText');
const counterElement = document.getElementById('counter');
const statusElement = document.getElementById('status');
const themeToggle = document.getElementById('themeToggle');

let previousCounterValue = null;

function initTheme() {
	const savedTheme = localStorage.getItem('theme');
	if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
		document.body.classList.add('dark-theme');
		themeToggle.textContent = '☀️';
	} else {
		themeToggle.textContent = '🌙';
	}
}

function toggleTheme() {
	document.body.classList.toggle('dark-theme');
	const isDark = document.body.classList.contains('dark-theme');
	themeToggle.textContent = isDark ? '☀️' : '🌙';
	localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

themeToggle.addEventListener('click', toggleTheme);

function updateExamples() {
	const origin = window.location.origin;
	document.getElementById('example1').textContent = `${origin}/api/update?text=hello`;
	document.getElementById('example2').textContent = `${origin}/api/update?text=test`;
}

function animateCounter() {
	counterElement.classList.remove('animate');
	counterElement.offsetHeight;
	counterElement.classList.add('animate');
	setTimeout(() => {
		counterElement.classList.remove('animate');
	}, 300);
}

function connect() {
	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
	const ws = new WebSocket(protocol + '//' + window.location.host + '/api/ws');
	
	ws.onopen = function() {
		statusElement.textContent = 'Connected - Updates in real-time';
		statusElement.className = 'status connected';
	};
	
	ws.onmessage = function(event) {
		const data = JSON.parse(event.data);
		if (data.type === 'update') {
			textElement.textContent = data.text || 'No text set';
			
			// Only animate if the counter value actually changed
			if (previousCounterValue !== null && previousCounterValue !== data.counter) {
				animateCounter();
			}
			
			counterElement.textContent = data.counter;
			previousCounterValue = data.counter;
		}
	};
	
	ws.onclose = function() {
		statusElement.textContent = 'Disconnected - Attempting to reconnect...';
		statusElement.className = 'status disconnected';
		// Reconnect after 3 seconds
		setTimeout(connect, 3000);
	};
	
	ws.onerror = function() {
		statusElement.textContent = 'Connection error - Retrying...';
		statusElement.className = 'status disconnected';
	};
}

initTheme();
updateExamples();
connect();