---
layout: default
title: "Dev Info R&D: 1K RTS"
---

# 1K RTS

## What is a 1K Prototype?

A "1K prototype" is a prototype of a game written in less than 1000 lines of fairly casual code, with a fairly informal plan for its features, and very basic art assets without animation-- just enough to make what's happening visible. It's kind of like a game jam, but you compress space instead of time, and it's an easier sort of thing to motivate yourself to do solo without an event backing it up. Building such a prototype generally requires relying on some engine or framework, or some existing personal codebase, to supply some basic rendering APIs that the prototype will be built on top of. 1000 lines of code doesn't sound like much; however, there seem to be very few genres that require much more than 1000 lines of code to effectively prototype. Most modern game genres are designed to be data driven, so the core update loops are relatively simple. The hardest games to squeeze into these constraints are games that are dependent on (even simple) AI or complex UI state machines.

The goal of a 1K prototype is not to serve as an example of how a professionally-made game *should* be programmed, or even to serve as the starting point to extend into a more complex codebase (although you could if you wanted). Instead, the objective is moreso to write such a prototype yourself in order to gain some perspective on the actual complexity of implementing a game. As it turns out, you can squeeze about 80% of the core appeal of a game into around 5% of the codebase. It's easy for this perspective to be lost when working on a protracted project, where efforts have shifted more towards invisible "engine work", where no amount of code changes seem to push the project forward at all.

The 1K number essentially serves as a guideline that naturally reduces scope creep and eliminates the possibility of excessive engine work. But the exact number isn't that important, so if you go a little bit over, you don't have to stress out about it.

Certain otherwise bad practices can be useful for reducing code count and building 1k prototypes more quickly. These include:

- Having overly-general base classes, to facilitate homogenous update loops, and pushing as much functionality as possible into this base class, even if that functionality is not used by most subclasses.
- Using conditional toggles to control the behavior of state machines, rather than just making more states, because different states will usually redundantly copy at least some parts of their functionality.

## A 1K Real-Time Strategy


### Path-Finding



These sorts of heuristic-based search algorithms generally use a [priority queue](https://en.wikipedia.org/wiki/Priority_queue). Unfortunately, the version of C# used in Unity currently doesn't include a priority queue in its standard library. Writing a priority queue from scratch is kind of annoying ([I've done it already anyways](todo), but...), but the bigger issue is that a proper priority queue implementation is going to take up a lot of our line count, and moreover, it's going to take up a lot of the time that we would prefer to spend on just quickly implementing the RTS's gameplay.

So, instead, I subsituted list with sorted insertions, which is a fairly naive implementation of a priority queue. However, this approach can't necessarily be written off simply for being naive. In the case of this RTS, you are performing an A* search through a grid with very few obstructions. This means that the nearest neighbors of the current search node are guaranteed to be among the most promising remaining nodes. As long as our sort order places the most-promising nodes at the end of our sorted list, insertion becomes essentially constant-time in all but the most degenerate cases where players specifically lay out buildings in a maze-like structure to confuse the path-finding algorithm. This is as-opposed to a more "proper" heap-based priority queue, which will have logarithmic insertion time for our more common scenario.

### UI



### Final Code Count



## Clone It

The full Unity project for this game can be found on github [here](todo).

## Play It

<div id="unity-container" class="unity-desktop">
  <div id="unity-canvas-scaler">
    <canvas id="unity-canvas"></canvas>
  </div>
  <div id="unity-loading-bar">
    <div id="unity-logo"></div>
    <div id="unity-progress-bar-empty">
      <div id="unity-progress-bar-full"></div>
    </div>
  </div>
  <div id="unity-warning"> </div>
  <div id="unity-footer">
    <div id="unity-webgl-logo"></div>
    <div id="unity-fullscreen-button"></div>
    <div id="unity-build-title">1K RTS</div>
  </div>
</div>
<script>
  var container = document.querySelector("#unity-container");
  var canvas = document.querySelector("#unity-canvas");
  var loadingBar = document.querySelector("#unity-loading-bar");
  var progressBarFull = document.querySelector("#unity-progress-bar-full");
  var fullscreenButton = document.querySelector("#unity-fullscreen-button");
  var warningBanner = document.querySelector("#unity-warning");

  // Shows a temporary message banner/ribbon for a few seconds, or
  // a permanent error message on top of the canvas if type=='error'.
  // If type=='warning', a yellow highlight color is used.
  // Modify or remove this function to customize the visually presented
  // way that non-critical warnings and error messages are presented to the
  // user.
  function unityShowBanner(msg, type) {
    function updateBannerVisibility() {
      warningBanner.style.display = warningBanner.children.length ? 'block' : 'none';
    }
    var div = document.createElement('div');
    div.innerHTML = msg;
    warningBanner.appendChild(div);
    if (type == 'error') div.style = 'background: red; padding: 10px;';
    else {
      if (type == 'warning') div.style = 'background: yellow; padding: 10px;';
      setTimeout(function() {
        warningBanner.removeChild(div);
        updateBannerVisibility();
      }, 5000);
    }
    updateBannerVisibility();
  }
  function resizeCanvas() {
    var inverse_aspect_ratio = 600.0 / 960.0;

    var canvas_scaler = document.getElementById('unity-canvas-scaler');
    var canvas = document.getElementById('unity-canvas');
    var width = canvas_scaler.clientWidth;
    var height = width * inverse_aspect_ratio;

    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    // Unity's rendering is driven off of these specific style
    // attributes, rather than the actual size of the canvas.
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  var project_identifier = "rts_webgl";
  var project_name = "1K RTS";
  var company_name = "Dev Info R&amp;D";

  var buildUrl = `/players/unity_${project_identifier}`;
  var loaderUrl = buildUrl + `/${project_identifier}.loader.js`;
  var config = {
    dataUrl: buildUrl + `/${project_identifier}.data`,
    frameworkUrl: buildUrl + `/${project_identifier}.framework.js`,
    codeUrl: buildUrl + `/${project_identifier}.wasm`,
    streamingAssetsUrl: "StreamingAssets",
    companyName: "Dev Info R&D",
    productName: project_name,
    productVersion: "0.1",
    showBanner: unityShowBanner,
  };

  // By default Unity keeps WebGL canvas render target size matched with
  // the DOM size of the canvas element (scaled by window.devicePixelRatio)
  // Set this to false if you want to decouple this synchronization from
  // happening inside the engine, and you would instead like to size up
  // the canvas DOM size and WebGL render target sizes yourself.
  // config.matchWebGLToCanvasSize = false;

  if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    // Mobile device style: fill the whole browser client area with the game canvas:

    var meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
    document.getElementsByTagName('head')[0].appendChild(meta);
    container.className = "unity-mobile";
    canvas.className = "unity-mobile";

    // To lower canvas resolution on mobile devices to gain some
    // performance, uncomment the following line:
    // config.devicePixelRatio = 1;

    unityShowBanner('WebGL builds are not supported on mobile devices.');
  } else {
    // Desktop style: Render the game canvas in a window that can be maximized to fullscreen:

    resizeCanvas();
  }

  loadingBar.style.display = "block";

  var script = document.createElement("script");
  script.src = loaderUrl;
  script.onload = () => {
    createUnityInstance(canvas, config, (progress) => {
      progressBarFull.style.width = 100 * progress + "%";
    }).then((unityInstance) => {
      loadingBar.style.display = "none";
      fullscreenButton.onclick = () => {
        unityInstance.SetFullscreen(1);
      };
    }).catch((message) => {
      alert(message);
    });
  };
  document.body.appendChild(script);
  window.addEventListener('resize', resizeCanvas);
</script>
