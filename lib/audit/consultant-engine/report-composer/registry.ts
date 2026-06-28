import { SectionDefinition, CompositionContext, WebsiteType } from "@/types";

class SectionRegistry {
  private sections: Map<string, SectionDefinition> = new Map();

  /**
   * Registers a new section definition for the composer.
   */
  public register(section: SectionDefinition) {
    if (this.sections.has(section.id)) {
      console.warn(`[SectionRegistry] Overwriting existing section: ${section.id}`);
    }
    this.sections.set(section.id, section);
  }

  /**
   * Evaluates all registered sections against the current context and plan,
   * returning an ordered array of sections to generate.
   */
  public getEligibleSections(context: CompositionContext, plan: "free" | "report_unlock" | "enterprise" | "pro"): SectionDefinition[] {
    const eligible: SectionDefinition[] = [];
    const reportDepth = context.reportDepth.level || "STANDARD";
    const depthLevel = this.getDepthLevel(reportDepth);
    const planLevel = this.getPlanLevel(plan === "pro" ? "report_unlock" : plan);
    const websiteType = context.businessContext.websiteType;

    for (const section of this.sections.values()) {
      // Check Plan Requirement
      if (this.getPlanLevel(section.requiredPlan) > planLevel) {
        continue; // Premium section, user is free
      }

      // Check Report Depth
      if (this.getDepthLevel(section.minReportDepth) > depthLevel) {
        continue; // Section requires COMPREHENSIVE, but report is BASIC
      }

      // Check Website Type Applicability
      if (section.applicableWebsiteTypes !== "ALL" && !section.applicableWebsiteTypes.includes(websiteType)) {
        continue; // Not applicable for this website type
      }

      eligible.push(section);
    }

    // Resolve dependencies and sort by priority
    return this.sortSections(eligible);
  }

  private getDepthLevel(depth: "BASIC" | "STANDARD" | "COMPREHENSIVE" | string): number {
    switch (depth) {
      case "BASIC": return 1;
      case "STANDARD": return 2;
      case "COMPREHENSIVE": return 3;
      default: return 2;
    }
  }

  private getPlanLevel(plan: "free" | "report_unlock" | "enterprise" | string): number {
    switch (plan) {
      case "free": return 1;
      case "report_unlock": return 2;
      case "enterprise": return 3;
      default: return 1;
    }
  }

  /**
   * Topologically sorts sections based on dependencies, and falls back to priority.
   */
  private sortSections(sections: SectionDefinition[]): SectionDefinition[] {
    const sorted: SectionDefinition[] = [];
    const visited = new Set<string>();
    const processing = new Set<string>();
    const sectionMap = new Map(sections.map((s) => [s.id, s]));

    const visit = (id: string) => {
      if (processing.has(id)) {
        console.warn(`[SectionRegistry] Circular dependency detected in section: ${id}`);
        return;
      }
      if (visited.has(id)) {
        return;
      }

      const section = sectionMap.get(id);
      if (!section) {
        // Dependency is either not registered or not eligible (e.g. filtered out)
        return;
      }

      processing.add(id);

      // Process required dependencies
      if (section.dependencies) {
        for (const depId of section.dependencies) {
          if (!sectionMap.has(depId)) {
            // A required dependency is missing! This section cannot be generated.
            processing.delete(id);
            return;
          }
          visit(depId);
        }
      }

      // Process optional dependencies (we just ensure they are ordered before us, if they exist)
      if (section.optionalDependencies) {
        for (const depId of section.optionalDependencies) {
          if (sectionMap.has(depId)) {
            visit(depId);
          }
        }
      }

      processing.delete(id);
      visited.add(id);
      sorted.push(section);
    };

    // We first sort the input array by priority (highest priority first)
    // so that when there are no dependencies, they naturally fall in priority order.
    // Wait, the topological sort visits nodes. To preserve priority among siblings,
    // we should iterate over them in priority order.
    const prioritySorted = [...sections].sort((a, b) => b.priority - a.priority);

    for (const section of prioritySorted) {
      visit(section.id);
    }

    return sorted;
  }
}

export const sectionRegistry = new SectionRegistry();
