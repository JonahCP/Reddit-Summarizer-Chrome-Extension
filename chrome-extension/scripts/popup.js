document.addEventListener('DOMContentLoaded', async function() {
    const summarizeButton = document.getElementById('summarizeButton');
    const loadingContainer = document.getElementById('loadingContainer');
    const loadingIcon = document.getElementById('loadingIcon');
    const output = document.getElementById('output');
    const apiURL = 'https://example';

    // Show the summary if it is already stored in the local storage
    // Get the active tab's URL
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentUrl = tabs[0].url;

    // Check if there is already a summary in storage and if the URL matches
    chrome.storage.local.get(['summary', 'storedUrl'], function(result) {
        console.log(result);
        if (result.summary && result.storedUrl === currentUrl) {
            // If a summary is found and the URL matches, show it in the output
            summarizeButton.style.display = 'none'; // Hide the button
            output.style.display = 'block'; // Show the output
            output.innerText = result.summary;
        } else {
            // Clear the storage if the URL is different (or on page refresh)
            chrome.storage.local.remove(['summary', 'storedUrl']);
        }
    });

    summarizeButton.addEventListener('click', async function() {
        output.innerText = ''; // Clear the output
        summarizeButton.style.display = 'none'; // Hide the button
        loadingContainer.style.display = 'block'; // Show loading container
        
        // Check if it's a reddit URL
        if (!currentUrl.includes('reddit.com')) {
            loadingIcon.style.display = 'none'; // Hide loading icon
            new TxtType(output, ['Sorry, this feature is only available for Reddit posts.'], 1000)
            output.style.display = 'block'; // Show the output
            return;
        }

        try {
            // Make a POST request to the server
            const response = await fetch(apiURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: currentUrl })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Parse the JSON response
            const data = await response.json();
            const sentiment = data.sentiment
            loadingIcon.style.display = 'none'; // Hide loading icon
            new TxtType(output, [sentiment], 1000)                
            chrome.storage.local.set({summary: sentiment, storedUrl: currentUrl})
            output.style.display = 'block'; // Show the output
        } catch (error) {
            console.error('Error:', error);
            loadingIcon.style.display = 'none'; // Hide loading icon
            new TxtType(output, ['Failed to fetch summary. Please try again later.'], 1000)
            output.style.display = 'block'; // Show the output
        }
    });

    // Define the typewriter effect
    var TxtType = function(el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = '';
        this.tick();
    };

    TxtType.prototype.tick = function() {
        var i = this.loopNum % this.toRotate.length;
        var fullTxt = this.toRotate[i];

        this.txt = fullTxt.substring(0, this.txt.length + 1);

        this.el.innerHTML = '<span class="wrap">'+this.txt+'</span>';

        var that = this;
        var delta = 15 // Controls speed of typing

        setTimeout(function() {
        that.tick();
        }, delta);
    };
});