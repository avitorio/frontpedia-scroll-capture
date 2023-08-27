console.log("Smooth Scroll Capture extension is running!");

function getDistanceToTop() {
  return document.documentElement.scrollTop || document.body.scrollTop;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(2 - 2 * t, 3) * 0.5;
}

function addRedLineAt(distanceToTop) {
  const line = document.createElement("div");
  line.style.position = "absolute";
  line.style.top = distanceToTop + "px";
  line.style.left = "0";
  line.style.width = "100vw";
  line.style.height = "3px";
  line.style.backgroundColor = "red";
  line.style.zIndex = "9999"; // Ensure it's above most elements on the page
  document.body.appendChild(line);
}

function smoothScrollByDistances(durationPerPixel, distances) {
  const currentDomain = window.location.hostname;
  const domainKey = "heroDelay_" + currentDomain;

  chrome.storage.local.get(domainKey, function (data) {
    const heroDelay = parseFloat(data[domainKey]) || 0; // Default to 0 if not set

    var start = null;
    var initialScrollTop = getDistanceToTop();
    var currentDistanceIndex = 0;

    function step(timestamp) {
      if (start === null) {
        start = timestamp;
      }
      var targetScrollTop = distances[currentDistanceIndex];
      var distanceToScroll = targetScrollTop - initialScrollTop;
      var adjustedDuration = durationPerPixel * distanceToScroll;
      var elapsed = timestamp - start;
      var linearProgress = Math.min(elapsed / adjustedDuration, 1);
      var smoothProgress = easeInOutCubic(linearProgress);
      var scrollAmount = initialScrollTop + distanceToScroll * smoothProgress;
      window.scrollTo(0, scrollAmount);

      if (linearProgress >= 1) {
        currentDistanceIndex++;
        if (currentDistanceIndex < distances.length) {
          start = null;
          initialScrollTop = scrollAmount;
          // Add a 2-second delay before scrolling to the next distance
          setTimeout(() => {
            window.requestAnimationFrame(step);
          }, 1000);
        } else {
          // All distances have been scrolled, clear the localStorage
          localStorage.removeItem("distancesToTop");
        }
      } else {
        window.requestAnimationFrame(step);
      }
    }

    setTimeout(() => {
      window.requestAnimationFrame(step);
    }, heroDelay * 1000);
  });
}

function captureAndScrollByDistances() {
  var distancesToTop = JSON.parse(localStorage.getItem("distancesToTop")) || [];

  window.addEventListener("click", function () {
    var currentDistance = getDistanceToTop();
    distancesToTop.push(currentDistance);
    addRedLineAt(currentDistance);
    console.log("Distances captured:", distancesToTop);
  });

  window.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.keyCode === 13) {
      const heroDelay = parseFloat(localStorage.getItem("heroDelay")) || 0; // Default to 0 if not set
      window.scrollTo(0, 0); // Scroll to top

      // Create the overlay
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "rgba(0,0,0,0.8)";
      overlay.style.zIndex = "9999";
      overlay.style.display = "flex";
      overlay.style.justifyContent = "center";
      overlay.style.alignItems = "center";

      // Create the countdown element
      const countdown = document.createElement("div");
      countdown.style.fontSize = "5rem";
      countdown.style.color = "white";
      countdown.textContent = "3"; // Start from 3

      overlay.appendChild(countdown);
      document.body.appendChild(overlay);

      let counter = 3;
      const interval = setInterval(() => {
        counter--;
        if (counter >= 0) {
          countdown.textContent = counter;
        } else {
          clearInterval(interval);
          overlay.remove(); // Remove the overlay

          // Continue with the existing logic
          setTimeout(() => {
            localStorage.setItem(
              "distancesToTop",
              JSON.stringify(distancesToTop)
            );
            location.reload();
          }, heroDelay * 1000); // Convert heroDelay to milliseconds
        }
      }, 1000);
    }
  });

  if (distancesToTop.length) {
    smoothScrollByDistances(2, distancesToTop);
    localStorage.removeItem("distancesToTop"); // Clear the distances from local storage after using them
  }
}

window.onload = function () {
  captureAndScrollByDistances();
};

captureAndScrollByDistances(); // Call it immediately as well
