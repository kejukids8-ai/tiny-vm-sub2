import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";

const STACK = 256, CALLS = 64, MEM = 256, STEPS_MAX = 1e6, OUT_MAX = 65536;
const TRAP = { UNDERFLOW: 2, OVERFLOW: 3, DIV_ZERO: 4, BAD_OPCODE: 5, MEMORY: 6,
  CALL_DEPTH: 7, RET_EMPTY: 8, PC: 9, STEPS: 10, OUTPUT: 11 };

const SHAPE = new Map([
  [0x00, [0, 0, 0]], [0x01, [1, 0, 1]], [0x02, [4, 0, 1]], [0x03, [0, 1, 0]],
  [0x04, [0, 1, 2]], [0x05, [0, 2, 2]], [0x06, [0, 2, 3]], [0x07, [0, 3, 3]],
  [0x10, [0, 2, 1]], [0x11, [0, 2, 1]], [0x12, [0, 2, 1]], [0x13, [0, 2, 1]],
  [0x14, [0, 2, 1]], [0x15, [0, 2, 1]], [0x16, [0, 2, 1]], [0x17, [0, 1, 1]],
  [0x18, [0, 2, 1]], [0x19, [0, 2, 1]], [0x1a, [0, 2, 1]], [0x1b, [0, 1, 1]],
  [0x1c, [0, 2, 1]], [0x1d, [0, 2, 1]], [0x1e, [0, 2, 1]], [0x20, [0, 2, 1]],
  [0x21, [0, 2, 1]], [0x22, [0, 2, 1]], [0x30, [2, 0, 0]], [0x31, [2, 1, 0]],
  [0x32, [2, 1, 0]], [0x33, [2, 0, 0]], [0x34, [0, 0, 0]], [0x40, [0, 1, 1]],
  [0x41, [0, 2, 0]], [0x50, [0, 1, 0]], [0x51, [0, 1, 0]], [0x52, [0, 0, 1]],
  [0x53, [0, 1, 0]],
]);

const utf8 = new TextEncoder();

function run(program, input) {
  const n = program.length;
  const st = new Int32Array(STACK);
  let sp = 0;
  const fr = new Int32Array(CALLS);
  let fp = 0;
  const mem = new Int32Array(MEM);
  const out = new Uint8Array(OUT_MAX);
  let ol = 0, ip = 0, pc = 0, steps = 0;
  const end = (exit, trap) => ({ stdout: out.slice(0, ol), exit, trap, steps });
  const bad = (t) => end(t, t);

  for (;;) {
    if (steps === STEPS_MAX) return bad(TRAP.STEPS);
    if (pc < 0 || pc >= n) return bad(TRAP.PC);
    const op = program[pc];
    const shape = SHAPE.get(op);
    if (shape === undefined) return bad(TRAP.BAD_OPCODE);
    const [imm, pops, pushes] = shape;
    if (pc + imm >= n) return bad(TRAP.PC);
    steps++;
    const next = pc + 1 + imm;
    if (sp < pops) return bad(TRAP.UNDERFLOW);
    if (sp - pops + pushes > STACK) return bad(TRAP.OVERFLOW);
    pc = next;

    switch (op) {
      case 0x00: return end(0, null); // HALT
      case 0x01: st[sp++] = (program[next - 1] << 24) >> 24; break; // PUSH8
      case 0x02: // PUSH32, little-endian
        st[sp++] = program[next - 4] | (program[next - 3] << 8)
          | (program[next - 2] << 16) | (program[next - 1] << 24);
        break;
      case 0x03: sp--; break; // POP
      case 0x04: st[sp] = st[sp - 1]; sp++; break; // DUP
      case 0x05: { const t = st[sp - 1]; st[sp - 1] = st[sp - 2]; st[sp - 2] = t; break; } // SWAP
      case 0x06: st[sp] = st[sp - 2]; sp++; break; // OVER
      case 0x07: { const a = st[sp - 3]; st[sp - 3] = st[sp - 2]; st[sp - 2] = st[sp - 1]; st[sp - 1] = a; break; } // ROT
      case 0x17: st[sp - 1] = -st[sp - 1] | 0; break; // NEG
      case 0x1b: st[sp - 1] = ~st[sp - 1]; break; // NOT
      default: {
        if (op >= 0x10 && op <= 0x22) { // alu
          const b = st[sp - 1], a = st[sp - 2];
          let r;
          switch (op) {
            case 0x10: r = (a + b) | 0; break;
            case 0x11: r = (a - b) | 0; break;
            case 0x12: r = Math.imul(a, b); break;
            case 0x13: if (b === 0) return bad(TRAP.DIV_ZERO); // DIV
              r = a === -2147483648 && b === -1 ? a : (a / b) | 0; break;
            case 0x14: if (b === 0) return bad(TRAP.DIV_ZERO);
              r = b === -1 ? 0 : a % b | 0; break; // MOD
            case 0x15: if (b === 0) return bad(TRAP.DIV_ZERO);
              r = Math.floor((a >>> 0) / (b >>> 0)) | 0; break;
            case 0x16: if (b === 0) return bad(TRAP.DIV_ZERO);
              r = (a >>> 0) % (b >>> 0) | 0; break;
            case 0x18: r = a & b; break;
            case 0x19: r = a | b; break;
            case 0x1a: r = a ^ b; break;
            case 0x1c: r = a << (b & 31); break;
            case 0x1d: r = a >> (b & 31); break;
            case 0x1e: r = (a >>> (b & 31)) | 0; break;
            case 0x20: r = a === b ? 1 : 0; break;
            case 0x21: r = a < b ? 1 : 0; break;
            case 0x22: r = a >>> 0 < b >>> 0 ? 1 : 0; break;
          }
          sp -= 2; st[sp++] = r;
        } else if (op <= 0x32) { // JMP/JZ/JNZ
          const rel = ((program[next - 2] | (program[next - 1] << 8)) << 16) >> 16;
          let take = true;
          if (op !== 0x30) { const v = st[--sp]; take = op === 0x31 ? v === 0 : v !== 0; }
          if (take) pc = next + rel;
        } else if (op === 0x33) { // CALL
          if (fp === CALLS) return bad(TRAP.CALL_DEPTH);
          fr[fp++] = next;
          pc = program[next - 2] | (program[next - 1] << 8);
        } else if (op === 0x34) { // RET
          if (fp === 0) return bad(TRAP.RET_EMPTY);
          pc = fr[--fp];
        } else if (op === 0x40) { // LOAD
          const a = st[sp - 1];
          if (a < 0 || a >= MEM) return bad(TRAP.MEMORY);
          st[sp - 1] = mem[a];
        } else if (op === 0x41) { // STORE
          const a = st[sp - 1], v = st[sp - 2];
          if (a < 0 || a >= MEM) return bad(TRAP.MEMORY);
          sp -= 2; mem[a] = v;
        } else if (op === 0x50) { // PRINT decimal
          const b = utf8.encode(String(st[sp - 1]));
          if (ol + b.length > OUT_MAX) return bad(TRAP.OUTPUT);
          sp--; out.set(b, ol); ol += b.length;
        } else if (op === 0x51) { // PUTC low byte
          if (ol + 1 > OUT_MAX) return bad(TRAP.OUTPUT);
          out[ol++] = st[--sp] & 255;
        } else if (op === 0x52) { // IN
          st[sp++] = ip < input.length ? input[ip++] : -1;
        } else { // 0x53 EXIT
          return end(st[--sp] & 255, null);
        }
      }
    }
  }
}

const IN = process.env.MAKEFUN_INPUT_DIR || "/input";
const OUT = process.env.MAKEFUN_OUTPUT_DIR || "/output";
for (const id of readdirSync(IN)) {
  mkdirSync(`${OUT}/${id}`, { recursive: true });
  try {
    const r = run(readFileSync(`${IN}/${id}/program.bin`), readFileSync(`${IN}/${id}/input.bin`));
    writeFileSync(`${OUT}/${id}/stdout.bin`, r.stdout);
    writeFileSync(`${OUT}/${id}/exit.txt`, String(r.exit));
  } catch {
    writeFileSync(`${OUT}/${id}/stdout.bin`, new Uint8Array(0));
    writeFileSync(`${OUT}/${id}/exit.txt`, "255");
  }
}
