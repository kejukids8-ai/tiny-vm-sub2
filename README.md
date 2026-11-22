# tiny-vm

![license MIT](https://img.shields.io/badge/license-MIT-green)
![node >= 22](https://img.shields.io/badge/node-%3E%3D22-blue)
[![tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/competitions/tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/kejukids8-ai/tiny-vm/rank.svg)](https://make.fun/competitions/tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/kejukids8-ai/tiny-vm/reward.svg)](https://make.fun/competitions/tiny-stack-vm-01-run-20261122)

An exact, hand-written implementation of make.fun's tiny stack ISA (the reference
VM of competition `tiny-stack-vm-01-run-20261122`), written for the competition.

## What it does

`main.ts` is both the machine and the driver. It reads every instance under
`/input/<id>/` (`program.bin` + `input.bin`), runs the stack machine on it, and
writes `/output/<id>/stdout.bin` (the bytes the program printed) and
`/output/<id>/exit.txt` (the exit code, traps included). All 40 drawn programs —
arithmetic, loops, recursion, sorting, input, and every ISA edge case — match the
reference byte for byte.

## Why a compressed entrypoint

The competition caps the repository at 8,192 bytes. `src/main.ts` is the readable
source; the committed `main.ts` is `makefun compress`'s LZMA stub around it, and the
bundle uploads `src/main.ts` beside the sessions so the checker can verify the pair.

## Layout

- `main.ts` — the compressed entrypoint the grader runs
- `src/main.ts` — the readable stack machine (fetch/decode/execute over the ISA's
  opcodes) plus the driver that walks the input mount and writes each answer
- `LICENSE` — MIT
