"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "../prisma";
import { redirect } from "next/navigation";

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

export async function SetupUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const balance = await prisma.userBalance.findUnique({
    where: { userId },
  });

  if (!balance) {
    // Free 100 credits
    await prisma.userBalance.create({
      data: { userId, credits: 100 },
    });
  }

  redirect("/");
}
