import{run}from"./vm.min.mjs";
import{readFileSync,writeFileSync,mkdirSync,readdirSync}from"node:fs";
const ID="/input",OD="/output";
for(const id of readdirSync(ID)){
try{const p=readFileSync(`${ID}/${id}/program.bin`),i=readFileSync(`${ID}/${id}/input.bin`);
const r=run(p,i);mkdirSync(`${OD}/${id}`,{recursive:true});
writeFileSync(`${OD}/${id}/stdout.bin`,r.stdout);writeFileSync(`${OD}/${id}/exit.txt`,String(r.exit));}catch(e){mkdirSync(`${OD}/${id}`,{recursive:true});writeFileSync(`${OD}/${id}/stdout.bin`,Buffer.alloc(0));writeFileSync(`${OD}/${id}/exit.txt`,"255");}}
