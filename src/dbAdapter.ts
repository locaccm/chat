import { PrismaClient } from "@prisma/client";
import { DBClient, User } from "./websocket";

const prisma = new PrismaClient();

function mapPrismaUserToUser(u: any): User {
  const { USEN_ID, ...rest } = u;
  return {
    id: USEN_ID,
    ...rest,
  };
}

const pgAdapter: DBClient = {
  async getUserById(id: string): Promise<User | null> {
    const prismaUser = await prisma.uSER.findUnique({
      where: { USEN_ID: Number(id) },
    });
    if (!prismaUser) return null;
    return mapPrismaUserToUser(prismaUser);
  },

  async saveMessage(from: string, to: string, message: string) {
    const newMessage = await prisma.mESSAGE.create({
      data: {
        MESN_SENDER: Number(from),
        MESN_RECEIVER: Number(to),
        MESC_CONTENT: message,
        MESB_NEW: true,
      },
    });
    return newMessage;
  },
};

export default pgAdapter;
