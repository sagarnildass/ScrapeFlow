"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "../prisma";
import { createCredentialSchema, createCredentialSchemaType } from "@/schema/credential";
import { revalidatePath } from "next/cache";
import { symmetricEncrypt } from "../encryption";

export async function GetCredentialsForUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return prisma.credential.findMany({
    where: {
      userId,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function CreateCredential(form: createCredentialSchemaType) {

  const { success, data } = createCredentialSchema.safeParse(form);

  if (!success) {
    throw new Error("Invalid form data");
  }

  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const encryptedValue = symmetricEncrypt(data.value);


  const result = await prisma.credential.create({
    data: {
      userId,
      name: data.name,
      value: encryptedValue,
    },
  });

  if (!result) {
    throw new Error("Failed to create credential");
  }

  revalidatePath("/credentials");
}

export async function DeleteCredential(name: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  await prisma.credential.delete({
    where: {
      userId_name: {
        userId,
        name,
      },
    },
  });

  revalidatePath("/credentials");


}