# SWARM Social
Decentralised social network based on SWARM.
## How to install
Dependencies installed through npm version 6.3.0.

Check your npm version:
```
npm -v
```

Install dependencies

```
npm install
```

## Development process

```
npm install uglifycss -g
```

```
npm install -g browserify
```

After changing or adding JS libraries, run
```
browserify js/web.js > js/dist/web.js
```

... CSS libraries
```
node css/uglify.js > css/uglify.css
```