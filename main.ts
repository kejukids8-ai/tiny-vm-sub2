// Tiny stack VM entrypoint — official secrets lane (RULES section Secrets).
// The VM source is the entry secret SRC; the driver loads it from the env.
eval(process.env.SRC);
