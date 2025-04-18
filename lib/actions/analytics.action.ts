"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "../prisma";
import { Period } from "@/types/analytics";
import { PeriodToDateRange } from "../helper/dates";
import { WorkflowExecutionStatus } from "@/types/workflow";
import { eachDayOfInterval, format } from "date-fns";

const { COMPLETED, FAILED } = WorkflowExecutionStatus;

type Stats = Record<string, { success: number; failed: number }>;

export async function GetPeriods() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const years = await prisma.workflowExecution.aggregate({
    where: { userId },
    _min: { startedAt: true },
  });

  const currentYear = new Date().getFullYear();

  const minYear = years._min.startedAt
    ? years._min.startedAt.getFullYear()
    : currentYear;

  const periods: Period[] = [];

  for (let year = minYear; year <= currentYear; year++) {
    for (let month = 0; month <= 11; month++) {
      periods.push({
        year,
        month,
      });
    }
  }

  return periods;
}

export async function GetStatsCardsValues(period: Period) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const dateRange = PeriodToDateRange(period);

  const executions = await prisma.workflowExecution.findMany({
    where: {
      userId,
      startedAt: { gte: dateRange.startDate, lte: dateRange.endDate },
      status: {
        in: [COMPLETED, FAILED],
      },
    },
    select: {
      creditsConsumed: true,
      phases: {
        where: {
          creditsConsumed: {
            not: null,
          },
        },
        select: {
          creditsConsumed: true,
        },
      },
    },
  });

  const stats = {
    workflowExecutions: executions.length,
    creditsConsumed: 0,
    phaseExecutions: 0,
  };

  stats.creditsConsumed = executions.reduce((acc, execution) => {
    return acc + execution.creditsConsumed;
  }, 0);

  stats.phaseExecutions = executions.reduce((acc, execution) => {
    return acc + execution.phases.length;
  }, 0);

  return stats;
}

export async function GetWorkflowExecutionStats(period: Period) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const dateRange = PeriodToDateRange(period);

  const executions = await prisma.workflowExecution.findMany({
    where: {
      userId,
      startedAt: { gte: dateRange.startDate, lte: dateRange.endDate },
    },
  });

  const dateFormat = "yyyy-MM-dd";

  const stats: Stats = eachDayOfInterval({
    start: dateRange.startDate,
    end: dateRange.endDate,
  })
    .map((date) => format(date, dateFormat))
    .reduce((acc, date) => {
      acc[date] = {
        success: 0,
        failed: 0,
      };
      return acc;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as any);

  executions.forEach((execution) => {
    const date = format(execution.startedAt!, dateFormat);
    if (execution.status === COMPLETED) {
      stats[date].success++;
    }
    if (execution.status === FAILED) {
      stats[date].failed++;
    }
  });

  const result = Object.entries(stats).map(([date, infos]) => ({
    date,
    ...infos,
  }));

  return result;
}
