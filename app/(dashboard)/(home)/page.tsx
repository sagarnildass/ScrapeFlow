import React, { Suspense } from "react";
import {
  GetPeriods,
  GetStatsCardsValues,
  GetWorkflowExecutionStats,
} from "@/lib/actions/analytics.action";
import PeriodSelector from "./_components/PeriodSelector";
import { Period } from "@/types/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { CirclePlayIcon, CoinsIcon, WaypointsIcon } from "lucide-react";
import StatsCard from "./_components/StatsCard";
import ExecutionStatusChart from "./_components/ExecutionStatusChart";

async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const currentDate = new Date();
  const params = await searchParams;

  const period: Period = {
    month: params?.month ? parseInt(params.month) : currentDate.getMonth(),
    year: params?.year ? parseInt(params.year) : currentDate.getFullYear(),
  };

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Home</h1>
        <Suspense fallback={<Skeleton className="w-[180px] h-[40px]" />}>
          <PeriodSelectorWrapper selectedPeriod={period} />
        </Suspense>
      </div>
      <div className="h-full py-6 flex flex-col gap-4">
        <Suspense fallback={<StatsCardSkeleton />}>
          <StatsCards selectedPeriod={period} />
        </Suspense>

        <Suspense fallback={<Skeleton className="w-full h-[300px]" />}>
          <StatsExecutionStats selectedPeriod={period} />
        </Suspense>
      </div>
    </div>
  );
}

async function PeriodSelectorWrapper({
  selectedPeriod,
}: {
  selectedPeriod: Period;
}) {
  const periods = await GetPeriods();
  return <PeriodSelector selectedPeriod={selectedPeriod} periods={periods} />;
}

async function StatsCards({ selectedPeriod }: { selectedPeriod: Period }) {
  const data = await GetStatsCardsValues(selectedPeriod);
  return (
    <div className="grid gap-3 lg:gap-8 lg:grid-cols-3 min-h-[120px]">
      <StatsCard
        title="Workflow Executions"
        value={data.workflowExecutions}
        icon={CirclePlayIcon}
      />

      <StatsCard
        title="Phase Executions"
        value={data.phaseExecutions}
        icon={WaypointsIcon}
      />

      <StatsCard
        title="Credits Consumed"
        value={data.creditsConsumed}
        icon={CoinsIcon}
      />
    </div>
  );
}

function StatsCardSkeleton() {
  return (
    <div className="grid gap-3 lg:gap-8 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="min-h-[120px] w-full" />
      ))}
    </div>
  );
}

async function StatsExecutionStats({ selectedPeriod }: { selectedPeriod: Period }) {
  const data = await GetWorkflowExecutionStats(selectedPeriod);
  return <ExecutionStatusChart data={data} />;
}

export default HomePage;
