document.addEventListener('DOMContentLoaded', function() {
    const summarizeButton = document.getElementById('summarizeButton');
    const loadingIcon = document.getElementById('loadingIcon');
    const output = document.getElementById('output');

    summarizeButton.addEventListener('click', async function() {
        output.innerText = ''; // Clear the output
        loadingIcon.style.display = 'block'; // Show loading icon

        // Get the active tab
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const url = tabs[0].url;

        // Make a POST request to the server
        const response = await fetch('http://localhost:8000/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });

        // Parse the JSON response
        const data = await response.json();
        output.innerText = data.sentiment; 
        loadingIcon.style.display = 'none'; // Hide loading icon
    });
});