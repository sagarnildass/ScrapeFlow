"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "../prisma";

export async function GetAvailableCredits() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const balance = await prisma.userBalance.findUnique({
    where: { userId },
  });

  if (!balance) {
    return -1;
  }

  return balance.credits;
}
