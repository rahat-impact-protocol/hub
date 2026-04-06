import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma:PrismaService){}
  getHello(): string {
    return 'Hello World!';
  }

 async getAccountSettings(){
    const data= await this.prisma.settings.findUnique({
      where:{
        name:'account'
      }
    });
    const valueJson = data?.value as any
    const details = {
      name:data?.name,
      value:{
        publicKey: valueJson?.publickey
      } 
    }
    console.log(details)
    return details;
  }
}
