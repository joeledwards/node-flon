# flon - FLat Object Notation

[![Build Status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]

Flattens JSON using the same format as [gron](https://github.com/tomnomnom/gron). Slower than gron, but doesn't parse the entire structure into memory first, allowing it to process infinite streams. Output retains the original order of elements rather than sorting by path.

## Installation

```shell
$ npm i -g flon
```

Or run via `npx`:

```shell
$ npx flon -u https://registry.npmjs.com/flon
```

## Example

```shell
$ cat package.json | flon
json = {};
json.name = "flon";
json.version = "1.4.5";
json.description = "FLat Object Notation compatible with gron (grep-able JSON)";
json.repository = "github:joeledwards/node-flon";
json.main = "index.js";
json.files = [];
json.files[0] = "package.json";
json.files[1] = "README.md";
json.files[2] = "bin/*";
json.files[3] = "lib/**/*.js";
json.bin = {};
json.bin.flon = "bin/flon.js";
json.scripts = {};
json.scripts.build = "npm ci && npm run lint && npm test";
json.scripts.lint = "standard";
json.scripts["lint:fix"] = "standard --fix";
json.scripts.test = "tap ./test/*.js";
json.keywords = [];
json.keywords[0] = "flon";
json.keywords[1] = "json";
json.keywords[2] = "flat";
json.keywords[3] = "object";
json.keywords[4] = "notation";
json.keywords[5] = "gron";
json.author = "Joel Edwards <joeledwards@gmail.com>";
json.license = "ISC";
json.dependencies = {};
json.dependencies["@buzuli/color"] = "^2.2.2";
json.dependencies.axios = "^0.19.2";
json.dependencies["buffered-stream"] = "0.0.1";
json.dependencies.clarinet = "^0.12.4";
json.dependencies.durations = "^3.4.2";
json.dependencies.ramda = "^0.27.1";
json.dependencies.yargs = "^15.4.1";
json.devDependencies = {};
json.devDependencies.standard = "^14.3.4";
json.devDependencies["stream-buffers"] = "^3.0.2";
json.devDependencies.tap = "^14.10.8";
```

## Options

```shell
$ flon --help
Options:
  --version                  Show version number                       [boolean]
  --file, -f                 read from specified file instead of stdin  [string]
  --url, -u                  read from specified URL instead of stdin   [string]
  --summary, -v              output summary info to stderr
                                                      [boolean] [default: false]
  --no-buffer, -B            flush every line as it is generated
                                                      [boolean] [default: false]
  --no-color, -C             do not colorize output   [boolean] [default: false]
  --allow-unknown-certs, -U  do not validate TLS certs[boolean] [default: false]
  --help                     Show help                                 [boolean]
```

[travis-url]: https://travis-ci.org/joeledwards/node-flon
[travis-image]: https://img.shields.io/travis/joeledwards/node-flon/master.svg
[npm-url]: https://www.npmjs.com/package/flon
[npm-image]: https://img.shields.io/npm/v/flon.svg
