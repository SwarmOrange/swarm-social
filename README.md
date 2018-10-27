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

http://127.0.0.1:8500/bzz:/{SWARM_HASH}/

For remote node:

https://swarm-gateways.net/bzz:/{SWARM_HASH}/
```

For example if you receive hash
```
07ef1099b4931a414f3601fcd1f69cd6404f5fc2b7360379f25e44d7677bf166
```
your result url will look like:
```
http://127.0.0.1:8500/bzz:/07ef1099b4931a414f3601fcd1f69cd6404f5fc2b7360379f25e44d7677bf166/

or

https://swarm-gateways.net/bzz:/07ef1099b4931a414f3601fcd1f69cd6404f5fc2b7360379f25e44d7677bf166/
```

## Development process

Dependencies installed through npm version 6.4.1.

Check your npm version:
```
npm -v
```

Update NPM:
```
npm install npm -g
```

Install dependencies

```
npm install
npm install uglifycss -g
npm install uglify-js -g
npm install browserify -g
npm install uglify-es -g
```


Compile all files into HTML (index.html)
```
npm run-script build
```

