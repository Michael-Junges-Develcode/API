import { PrismaClient } from "@prisma/client";
import { request } from "express";
import { Token } from "graphql";

const prisma = new PrismaClient();
export interface Context {
  prisma: PrismaClient;
  token: string;
}

export const context: Context = {
  prisma,
};
