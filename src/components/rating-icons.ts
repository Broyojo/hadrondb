import { BadgeCheck, CircleCheck, CircleX, OctagonAlert, TriangleAlert, type LucideIcon } from "lucide-react";
import type { RatingId } from "@/lib/ratings";

export const RATING_ICONS: Record<RatingId, LucideIcon> = {
  perfect: BadgeCheck,
  well: CircleCheck,
  issues: TriangleAlert,
  unplayable: OctagonAlert,
  broken: CircleX,
};
