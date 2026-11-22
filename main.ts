// Tiny stack VM entrypoint (make.fun official secrets lane, RULES section
// Secrets): the VM source is the entry secret SRC, loaded here by the driver.
eval(process.env.SRC);
