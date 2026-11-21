import{run}from"./vm.min.mjs";
import{readFileSync,writeFileSync,mkdirSync,readdirSync}from"node:fs";
const ID=process.env.MAKEFUN_INPUT_DIR||"/input",OD=process.env.MAKEFUN_OUTPUT_DIR||"/output";
for(const id of readdirSync(ID)){
try{const p=readFileSync(`${ID}/${id}/program.bin`),i=readFileSync(`${ID}/${id}/input.bin`);
const r=run(p,i);mkdirSync(`${OD}/${id}`,{recursive:true});
writeFileSync(`${OD}/${id}/stdout.bin`,r.stdout);writeFileSync(`${OD}/${id}/exit.txt`,String(r.exit));}catch(e){mkdirSync(`${OD}/${id}`,{recursive:true});writeFileSync(`${OD}/${id}/stdout.bin`,new Uint8Array(0));writeFileSync(`${OD}/${id}/exit.txt`,"255");}}
