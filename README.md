# SWARM Social
Decentralised social network based on SWARM.
## How to upload

Download project and run command to upload to local SWARM node:

```
swarm --recursive --defaultpath index.html up ./swarm-social
```

...upload to remote server:

```
swarm --recursive --defaultpath index.html --bzzapi http://swarm-gateways.net/ up ./swarm-social
```

After success uploading you receive SWARM hash. Replace {SWARM_HASH} with your hash:

```
For local node:

http://127.0.0.1:8500/bzz:/{SWARM_HASH}/index.html

For remote node:

https://swarm-gateways.net/bzz:/{SWARM_HASH}/index.html
```

For example if you receive hash
```
07ef1099b4931a414f3601fcd1f69cd6404f5fc2b7360379f25e44d7677bf166
```
your result url will look like:
```
http://127.0.0.1:8500/bzz:/07ef1099b4931a414f3601fcd1f69cd6404f5fc2b7360379f25e44d7677bf166/index.html

or

https://swarm-gateways.net/bzz:/07ef1099b4931a414f3601fcd1f69cd6404f5fc2b7360379f25e44d7677bf166/index.html
```

## Development process

Dependencies installed through npm version 6.3.0.

Check your npm version:
```
npm -v
```

Update NPM:
```
npm install -g npm
```

Install dependencies

```
npm install
```

```
npm install uglifycss -g
```

```
npm install -g uglify-js
```

```
npm install -g browserify
```

After changing or adding JS libraries, run
```
browserify js/web-modules.js > js/dist/web-modules.js && browserify js/web-full.js > js/dist/web-full.js
```

... CSS libraries
```
node css/uglify.js > css/uglify.css
```

Compile all files to HTML
```
node ./build.js 
```