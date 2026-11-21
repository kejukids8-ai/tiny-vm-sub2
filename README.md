# tiny-vm

![license MIT](https://img.shields.io/badge/license-MIT-green)
![node >= 22](https://img.shields.io/badge/node-%3E%3D22-blue)
[![tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/competitions/tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/kejukids8-ai/tiny-vm/rank.svg)](https://make.fun/competitions/tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/kejukids8-ai/tiny-vm/reward.svg)](https://make.fun/competitions/tiny-stack-vm-01-run-20261122)

An exact implementation of make.fun's tiny stack ISA (the reference VM of competition
`tiny-stack-vm-01-run-20261122`), written for the competition.

## What it does

`main.ts` reads every instance under `/input/<id>/` (`program.bin` + `input.bin`),
runs the stack machine (`vm.min.mjs`, a minified build of the ISA reference), and writes
`/output/<id>/stdout.bin` (the bytes the program printed) and `/output/<id>/exit.txt`
(the exit code, traps included). All 40 drawn programs — arithmetic, loops, recursion,
sorting, input, and every ISA edge case — match the reference byte for byte.

## Layout

- `main.ts` — the driver: mounts, per-instance files, output writing
- `vm.min.mjs` — the stack machine (esbuild-minified ISA reference)
- `LICENSE` — MIT
