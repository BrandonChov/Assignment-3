const bulb = `💡`;
const bulb_div = document.getElementById('lightbulb')!;
let pid: NodeJS.Timeout | null = null;
let vals: number[] = [.2, .3, .7, .8, .5];
let enc: number[] = vals.map(mapValueToPixel);

let lastMeasurementTime: number = Date.now();  // Track the time of the last measurement
let yellowClicks = { top: 0, bottom: 0 }; // Track clicks in yellow areas

const pointsDiv = document.getElementById("points-div")!;
const codeDiv = document.getElementById('code')! as HTMLInputElement;
pointsDiv.innerHTML = '';

// Add a measurement
function addPoint() {
    vals.shift();
    enc.shift();
    const val = Number(codeDiv.value);
    const e = mapValueToPixel(val);
    vals.push(val);
    enc.push(mapValueToPixel(vals[vals.length - 1]));
    console.log('val', val, 'e', e);
    const ans = vals.map((v, i) => `<div class='point' style='margin-left:${(i + 1) * 125}px; top:${mapValueToPixel(v)}px'></div>`);
    console.log(ans, vals);
    pointsDiv.innerHTML = ans.join('');
    checkMeasurement(val);
    lastMeasurementTime = Date.now();  // Update the last measurement time
}

// Map value to pixel (scaled)
function mapValueToPixel(value: number): number {
    const maxValue = 0.6;
    const maxPixel = 290;
    if (value < 0) value = 0;
    if (value > maxValue) value = maxValue;
    const ans = maxPixel - (value / maxValue * maxPixel);
    console.log('value', value, 'ans', ans);
    return ans;
}

// Check the value of the measurement and determine the appropriate action
function checkMeasurement(value: number) {
    const pixelPosition = mapValueToPixel(value);
    const topRedThreshold = 10;  // For example, below this pixel position is considered top red
    const bottomRedThreshold = 280;  // For example, above this pixel position is considered bottom red
    const topYellowThreshold = 100; // Example threshold for yellow zone (top)
    const bottomYellowThreshold = 200; // Example threshold for yellow zone (bottom)

    // Check if the measurement is in the top or bottom red region
    if (pixelPosition <= topRedThreshold) {
        panic();
        alert("Tighten the screw and remeasure.");
    } else if (pixelPosition >= bottomRedThreshold) {
        panic();
        alert("Loosen the screw and remeasure.");
    }
    
    // Handle yellow region double-click logic
    if (pixelPosition >= topYellowThreshold && pixelPosition <= bottomYellowThreshold) {
        const region = (pixelPosition < 150) ? "top" : "bottom";  // Define if top or bottom yellow
        yellowClicks[region]++;

        if (yellowClicks[region] >= 2) {
            panic();
            if (region === "top") {
                alert("Tighten the screw.");
            } else {
                alert("Loosen the screw.");
            }
            yellowClicks = { top: 0, bottom: 0 }; // Reset yellow clicks after action
        }
    }

    // If valid measurement (not red or yellow), calm the flashing
    if (pixelPosition > topRedThreshold && pixelPosition < bottomRedThreshold &&
        pixelPosition < topYellowThreshold && pixelPosition > bottomYellowThreshold) {
        calm();
    }

    // Automatic flashing every minute after the last measurement
    const currentTime = Date.now();
    if (currentTime - lastMeasurementTime >= 60000) {
        lastMeasurementTime = currentTime;
        panic();
        alert("Please take a new measurement.");
    }
}

// Flashing function
function flip(): string {
    if (bulb_div.innerHTML == bulb) return bulb_div.innerHTML = '';
    return bulb_div.innerHTML = bulb;
}

// Panic flashing
function panic() {
    bulb_div.style.background = 'red';
    pid = setInterval(() => { flip(); }, 300);
}

// Calm flashing
function calm() {
    bulb_div.style.background = 'transparent';
    if (pid) {
        clearInterval(pid);
        pid = null;
    }
}

// Call addPoint on button or other event to trigger the process
addPoint();
