document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Charts
    const ctx = document.getElementById('threatChart').getContext('2d');
    let threatChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Healed (Autonomous)', 'Flagged (Manual)'],
            datasets: [{
                data: [0, 0], // Placeholders
                backgroundColor: ['#28a745', '#ffc107'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: 'System Healing Efficiency' }
            }
        }
    });

    // 2. Function to Fetch Stats and Update UI
    async function updateDashboard() {
        try {
            // Fetch stats from your new Flask route [cite: 84]
            const response = await fetch('/threats/stats');
            const stats = await response.json();

            // Update Numerical Displays [cite: 51]
            document.getElementById('totalDetected').innerText = stats.total_detected;
            document.getElementById('totalHealed').innerText = stats.total_healed;
            document.getElementById('efficiencyRate').innerText = stats.efficiency;

            // Update Chart.js Data 
            threatChart.data.datasets[0].data = [
                stats.total_healed, 
                stats.total_detected - stats.total_healed
            ];
            threatChart.update();

            // Refresh the Recent Threats Table [cite: 57]
            updateThreatTable();

        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    }

    // 3. Function to Populate the Recent Activity Table
    async function updateThreatTable() {
        try {
            const response = await fetch('/threats');
            const threats = await response.json();
            const tableBody = document.getElementById('threatTableBody');
            
            tableBody.innerHTML = ''; // Clear existing rows

            // Display latest 5 threats [cite: 48]
            threats.slice(0, 5).forEach(threat => {
                const row = `
                    <tr>
                        <td>${threat.timestamp}</td>
                        <td>${threat.type || 'Anomaly'}</td>
                        <td>${(threat.confidence * 100).toFixed(1)}%</td>
                        <td><span class="badge ${threat.status === 'Healed' ? 'bg-success' : 'bg-warning'}">
                            ${threat.status}</span>
                        </td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML('beforeend', row);
            });
        } catch (error) {
            console.error('Error fetching threat logs:', error);
        }
    }

    // 4. Set intervals for real-time updates [cite: 46]
    updateDashboard();
    setInterval(updateDashboard, 5000); // Refresh every 5 seconds
});