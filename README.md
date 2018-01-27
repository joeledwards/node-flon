# flon - FLat Object Notation

[![Build Status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]

Flattens JSON using the same format as [gron](https://github.com/tomnomnom/gron).

## Installation

```shell
$ npm i -g flon
```

## Example

```shell
$ cat package.json | flon
json = {}
json.name = "flon"
json.version = "1.0.0"
json.description = "FLat Object Notation compatible with gron"
json.main = "index.js"
json.bin.flon = "node ./bin/flon.js"
json.scripts.test = "tap ./test/*.js"
json.keywords[0] = "flon"
json.keywords[1] = "json"
json.keywords[2] = "flat"
json.keywords[3] = "object"
json.keywords[4] = "notation"
json.keywords[5] = "gron"
json.author = "Joel Edwards <joeledwards@gmail.com>"
json.license = "ISC"
json.dependencies.axios = "^0.17.1"
json.dependencies.oboe = "^2.1.4"
json.dependencies.ramda = "^0.25.0"
json.dependencies.yargs = "^11.0.0"
json.devDependencies.tap = "^11.0.1"
```

## Options

```shell
$ flon --help
Options:
  --version   Show version number                                      [boolean]
  --file, -f  read from specified file instead of stdin                 [string]
  --url, -u   read from specified URL instead of stdin                  [string]
  --help      Show help                                                [boolean]
```

[travis-url]: https://travis-ci.org/joeledwards/node-flon
[travis-image]: https://img.shields.io/travis/joeledwards/node-flon/master.svg
[npm-url]: https://www.npmjs.com/package/flon
[npm-image]: https://img.shields.io/npm/v/flon.svg
