import { PrismaClient } from '@prisma/client';
import { Wallet } from 'ethers';

const prisma = new PrismaClient();

async function main() {
  const walletDetails: any = await walletGeneration();
  const settings = await prisma.settings.create({
    data: {
      name: 'account',
      value: walletDetails,
      dataType: 'OBJECT',
      isPrivate: true,
      isReadOnly: true,
    },
  });
  return settings;
}

async function walletGeneration() {
  const wallet = await Wallet.createRandom();
  const details = {
    publickey: wallet.publicKey,
    privateKey: wallet.privateKey,
    address: wallet.address,
    menomonics: wallet.mnemonic,
  };
  return details;
}
