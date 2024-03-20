# reminiflux

## Overview

Reminiflux is an alternative web frontend for [miniflux](https://github.com/miniflux/miniflux), the minimalist and opinionated feed reader. Reminiflux offers a look and feel which is more similar to Google Reader and TT-RSS with a 3-paned display showing the list of feeds, items and an article.

Main features:
- List of all/unread feeds grouped by category, with number of unread items displayed
- List of all/unread items per feed or per category, sorted by date ascending/descending
- List of all/unread starred items
- Collapse/expand categories
- Display of feed favicons (cached locally)
- One-button actions to mark all items as read or mark items before/after selection as read
- Keyboard navigation and actions (press `h`)
- Send to Wallabag (if configured)
- Light and dark themes
- Configuration is persisted in the browser's local storage

[**Launch reminiflux now at https://reminiflux.github.io**](https://reminiflux.github.io)
(see below for details)

## Screenshots
![Screenshot - Light theme](https://raw.githubusercontent.com/reminiflux/reminiflux/source/docs/screenshot-light.png)
![Screenshot - Dark theme](https://raw.githubusercontent.com/reminiflux/reminiflux/source/docs/screenshot-dark.png)
![Screen capture](https://raw.githubusercontent.com/reminiflux/reminiflux/source/docs/capture.gif)

## Usage

Reminiflux is pure web application written in React that uses the API provided by miniflux, it does not need any further backend and can be deployed anywhere as a bunch of HTML, CSS and JS files. It stores its configuration data and cache in the browser's local storage. Therefore it can be used straight away by opening it from Github and configuring it to connect to your already running instance of miniflux.

**Attention! Connecting to miniflux api requires a miniflux version that supports CORS (implemented in [this PR](https://github.com/miniflux/miniflux/pull/691)). If you are using an older version, read below about possible workarounds.**

[**Launch reminiflux now at https://reminiflux.github.io**](https://reminiflux.github.io)

## Installation

As reminiflux is just a bunch of web page files, you can use the version hosted above at Github or you can host these files anywhere you want. To compile the sources in the repo to production version (optimized HTML, CSS and JS files), use the following commands (you will need [Node.js and npm](https://nodejs.org/) installed):
 
    $ git clone https://github.com/reminiflux/reminiflux.git
	$ cd reminiflux
	$ npm install
	$ npm run build

The compiled files will be in the `build` directory, which you can serve with any kind of static web hosting, or alternatively, directly from the directory with the following command:

    $ npm install -g serve
    $ serve -s build

## Configuration

Configuration of reminiflux is supposed to be very easy: you only need to supply the URL to your running miniflux instance, an API key that you have generated in miniflux for authenticating against its API and that's it. Reminiflux will connect to this instance from your browser and cache the connection details so that you do not have to enter them again. You will be able to change these parameters in the settings screen.

**There is one caveat however:** Miniflux's API only recently started to support [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) requests, which enable web applications such as reminiflux to call the API services directly from a browser and from a different location (origin). Without this, API calls from the browser would only work if reminiflux and miniflux would share the same origin (i.e. same protocol, host and port), which might be complicated for most to set up.

CORS support was initiated [here](https://github.com/miniflux/miniflux/issues/675) and implemented [here](https://github.com/miniflux/miniflux/pull/691). It is recommended that you upgrade to a version of miniflux which includes this feature. If you are however using an older version of miniflux, there are multiple options available for a workaround.

### Option 1: Use a CORS proxy

The problem can be solved by introducing a CORS proxy between reminiflux and miniflux. This proxy will modify the responses coming from miniflux to make the browser running reminiflux believe that miniflux supports CORS.

#### Option 1/A: Use a hosted service

There are several hosted CORS proxies available, e.g. [cors-anywhere](https://cors-anywhere.herokuapp.com/) or [thingproxy](https://github.com/Freeboard/thingproxy). Using the hosted solutions is as simple as prefixing your miniflux URL with the proxy's URL (see documentation of each provider for particulars), however this comes with the following caveats:
1. This only works if your miniflux instance is available on the internet, as the hosted proxy needs to be able to connect to it. It does not work in case your miniflux is available only in your local intranet.
2. Free hosted services can be slow or artifically throttled and/or volume of transferred data can be limited.
3. Using a free hosted service will reveal to this service your miniflux API key and all the content that you read.

#### Option 1/B: Host your own CORS proxy

You can easily deploy your own CORS proxy that will eliminate all the issues mentioned with the hosted solution. There are several solutions available on Github, but [cors-anywhere](https://github.com/Rob--W/cors-anywhere) is tested, works well and can be deployed easily. Dockerized versions are also available e.g. [here](https://github.com/yasinuslu/docker-cors-anywhere).

Note that you can still use reminiflux hosted on the internet even if your own CORS proxy is available only in your intranet. Only the browser needs to be able to access the CORS proxy.

### Option 2: Use your reverse proxy

If you have a reverse proxy in front of miniflux, this is the easiest and fastest solution. You can configure your reverse proxy to modify the responses of miniflux so that your browser will believe that it supports CORS.

In case of nginx, you will only need to add the following lines to your configuration:

    # Implement the preflight requests i.e. OPTIONS
    if ($request_method = OPTIONS ) {
        add_header Content-Length 0;
        add_header Content-Type text/plain;
        add_header Access-Control-Allow-Origin '*';
        add_header Access-Control-Allow-Headers 'X-Auth-Token';
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, OPTIONS';
        return 200;
    }
    # Add CORS headers to other requests
    add_header Access-Control-Allow-Origin '*';
    add_header Access-Control-Allow-Headers 'X-Auth-Token';

If you are using [nginx-proxy](https://github.com/nginx-proxy/nginx-proxy), you can drop a file named `<miniflux.full.domain>_location` in the `vhosts` folder of your configuration location with the above content and it will work.

If you are using another reverse proxy, you will need to follow its configuration instructions to achieve the same result.

### Option 3: Use Docker container

While it would not make sense to host reminiflux in a Docker container itself, a Docker container has been prepared that contains both reminiflux and a proxy server to circumvent the CORS issue. With this solution, the application and the proxy will be at the same origin (the Docker container), and therefore CORS will not be involved. The proxy will transparently forward your requests to your miniflux instance. If you are able to host Docker containers, this is probably the easiest solution for the time being.

The image is available on Docker Hub as [abali/reminiflux](https://hub.docker.com/repository/docker/abali/reminiflux) and you can use it in the following way:

    $ docker run -p 8080:80 abali/reminiflux

Reminiflux will be available on port 8080 of your Docker host and you should set your miniflux URL to `http://<dockerhost:dockerport>/p/<your original miniflux url>` e.g. `http://localhost:8080/p/https://miniflux.mytld.com`.

Alternatively, you can use the supplied Dockerfile to build the container yourself:

    $ git clone https://github.com/reminiflux/reminiflux.git
    $ cd reminiflux
    $ docker build . -t reminiflux
    $ docker run -p 8080:80 reminiflux

## Future plans and contributing

Reminiflux should be a fully functional alternative web frontend for miniflux. Some administrative features or features not exposed by miniflux's API might remain available only in miniflux.

Reminiflux is open source software and you are encouraged to send pull requests via Github that improve the software.

## License

Reminiflux is licensed under GPL 3.0.
