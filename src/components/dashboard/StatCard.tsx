import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { cn } from "../../libs/utils";

export interface StatCardProps {
  title: string;
  description: string;
  value: React.ReactNode;
  icon: LucideIcon;
  className?: string;
}

/** Single dashboard metric. Receives an already-computed value; it calculates nothing. */
const StatCard = ({ title, description, value, icon: Icon, className }: StatCardProps) => (
  <Card className={cn("flex flex-col gap-4 p-5 transition-shadow hover:shadow-dc-md", className)}>
    <div className="flex items-start justify-between gap-3">
      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
        <Icon aria-hidden="true" className="size-5" />
      </div>
      <span className="dc-numeric text-3xl font-bold tracking-tight text-foreground">{value}</span>
    </div>
    <div className="flex flex-col gap-1">
      <h3 className="dc-h4">{title}</h3>
      <p className="dc-caption">{description}</p>
    </div>
  </Card>
);

/** Matching placeholder used while the dashboard request is in flight. */
const StatCardSkeleton = () => (
  <Card className="flex flex-col gap-4 p-5">
    <div className="flex items-start justify-between gap-3">
      <Skeleton className="size-11 rounded-xl" />
      <Skeleton className="h-8 w-16" />
    </div>
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-2/5" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  </Card>
);

export { StatCard, StatCardSkeleton };
