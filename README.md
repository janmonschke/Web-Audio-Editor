# Web Audio Editor

A web-based audio editor which allows you to create songs from your browser in collaboration with your band members/friends.

If you want to have a look at how the editor works (especially that part where my brother and my flat mate are jamming a RHCP song), check out [the video of my presentation from JSCONF.eu 2014](http://youtu.be/cqtBpCqgOgM):

[![Presenting the editor at JSCONF.eu 2014](http://img.youtube.com/vi/cqtBpCqgOgM/0.jpg)](http://youtu.be/cqtBpCqgOgM)

Warning: this repo is only a proof of concept and the code is not perfect ;)

## Setup

0. You need node.js, grunt, redis and CouchDB on your computer
1. `npm install`
2. Copy `server/config/config.js.sample` to `server/config/config.js` and fill it with your credentials
3. `grunt w`
4. `node server.js`
5. `open http://localhost:3000`

## Understanding the code

While having a look at the code, you might have realized that there is not much documentation and I'm sorry for that ;) I explained the concepts of my code in my thesis (see below) and reading certain parts of it might help to understand the editor. If not, just drop me a message and I'm happy to help.

## Thesis

This work is the result of my master's thesis which you can find here: ([PDF version](http://cl.ly/1H111o1w1Z0T)) ([Github Repo](https://github.com/janmonschke/Master-s-Thesis---Web-Audio-DAW))

## Bugs

- Sometimes it doesn't sync correctly, need to deep dive in the algorithm more...
