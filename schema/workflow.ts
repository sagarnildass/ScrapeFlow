import { z } from "zod";

export const createWorkflowSchema = z.object({
    name: z.string().max(50, { message: "Name must be less than 50 characters" }),
    description: z.string().max(80, { message: "Description must be less than 80 characters" }).optional(),
})

export type createWorkflowSchemaType = z.infer<typeof createWorkflowSchema>