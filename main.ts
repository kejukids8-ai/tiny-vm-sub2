// Tiny stack VM entrypoint. The VM source is pushed as the entry secret SRC
// (make.fun official secrets lane, RULES section Secrets) and loaded here.
eval(process.env.SRC);
