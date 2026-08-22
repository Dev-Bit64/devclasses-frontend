import {
  Briefcase,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  FileDown,
  Gauge,
  GraduationCap,
  Layers,
  LineChart,
  ListChecks,
  MessagesSquare,
  MonitorPlay,
  Search,
  Timer,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

/**
 * Explicit icon map. Named rather than dynamically imported so the bundler can tree-shake
 * lucide-react down to just the icons the landing page actually uses.
 */
export const LANDING_ICONS: Record<string, LucideIcon> = {
  Briefcase,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  FileDown,
  Gauge,
  GraduationCap,
  Layers,
  LineChart,
  ListChecks,
  MessagesSquare,
  MonitorPlay,
  Search,
  Timer,
  TrendingUp,
};
