document.addEventListener('DOMContentLoaded', function() {
    const summarizeButton = document.getElementById('summarizeButton');
    const loadingContainer = document.getElementById('loadingContainer');
    const loadingIcon = document.getElementById('loadingIcon');
    const output = document.getElementById('output');

    // summarizeButton.addEventListener('click', async function() {
    //     output.innerText = ''; // Clear the output
    //     loadingIcon.style.display = 'block'; // Show loading icon

    //     // Get the active tab
    //     const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    //     const url = tabs[0].url;

    //     // Make a POST request to the server
    //     const response = await fetch('http://localhost:8000/summarize', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({ url: url })
    //     });

    //     // Parse the JSON response
    //     const data = await response.json();
    //     output.innerText = data.sentiment; 
    //     loadingIcon.style.display = 'none'; // Hide loading icon
    // });

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

    summarizeButton.addEventListener('click', async function() {
        output.innerText = ''; // Clear the output
        summarizeButton.style.display = 'none'; // Hide the button
        loadingContainer.style.display = 'block'; // Show loading container

        // delay for 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));

        sentiment = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin malesuada diam sit amet nibh sollicitudin auctor. Mauris eu nisl et lectus tincidunt maximus et sed risus. Maecenas sapien justo, consectetur euismod blandit nec, fringilla sit amet dolor. Phasellus accumsan tincidunt magna at porttitor. Donec congue, lectus in consequat tincidunt, metus massa rhoncus ipsum, ac vestibulum dolor ipsum quis."
        loadingIcon.style.display = 'none'; // Hide loading icon
        new TxtType(output, [sentiment], 1000)        
    });

});