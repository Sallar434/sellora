const fs=require('fs');const p='prisma/schema.prisma';fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace('provider = "sqlite"','provider = "postgresql"'));console.log('schema -> postgresql');
