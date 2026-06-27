import {
  evaluateWebsiteCoherence,
} from "../lib/audit/consultant-engine/engines/cross-page";
import { buildRelationshipGraph } from "../lib/audit/consultant-engine/engines/relationship-graph";
import { inferRootCauses } from "../lib/audit/consultant-engine/engines/root-cause";
import { discoverOpportunities } from "../lib/audit/consultant-engine/engines/opportunities";
import { annotatePsychology } from "../lib/audit/consultant-engine/engines/psychology";
import { estimateRevenueImpact } from "../lib/audit/consultant-engine/engines/revenue-impact";
import { generateConsultantReport } from "../lib/audit/consultant-engine";

// Just a dummy script to ensure tsc can compile the entry points.
console.log("Benchmarks compiler test.");
