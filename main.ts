// tiny-stack-vm entrypoint: VM source lives in the entry secret SRC
// (official secrets lane, per RULES section Secrets).
eval(process.env.SRC);
