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
  // Hide scrollbar
  var style = document.createElement("style");
  style.type = "text/css";
  style.innerHTML = `html::-webkit-scrollbar { width: 0px; }`;
  document.getElementsByTagName("head")[0].appendChild(style);

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
      setTimeout(() => {
        localStorage.setItem("distancesToTop", JSON.stringify(distancesToTop));
        location.reload();
      }, heroDelay * 1000); // Convert heroDelay to milliseconds
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
