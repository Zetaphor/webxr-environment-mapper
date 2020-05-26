# Three.js VR WebXR Boilerplate code
This project contain the bare minimum files required in order to get a WebXR VR scene up and running using Three.js.  Everything is included, even the Three.js files.

The folder structure copies the folder structure of Three.js itself.


## Requirements
* A web server, e.g. NPM http-server: https://www.npmjs.com/package/http-server 
* A WebXR-enabled browser.  Most VR helmets come with one.  As of writing this, Firefox Reality does NOT support WebXR.


## How to Run
* I recommend using the NPM http-server: https://www.npmjs.com/package/http-server 
* Run it with the command "http-server -S -C cert.pem" in the folder containing your code.
* Open your WebXR-enabled browser and go to the URL shown in your console, adding "/index.html" to the end.  You'll get warnings about it being a self-signed certificate.


## How to Use
* To move the camera (and controller) in code, change the position of the "dolly" object.
* "intersectedObject" contains whatever object the user is pointing at.  "intersectedPosition" contains the point where the selection is occurring.
* There are methods called to add a floor and some floating cubes.  Remove these method calls to start with an empty scene.


## Credits
+ Programmed by stephen.carlylesmith@googlemail.com
* Based on the Three.js example code.
