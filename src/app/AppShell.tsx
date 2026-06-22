import {
  BarChart3,
  BookOpen,
  Boxes,
  CheckCircle2,
  Circle,
  FileText,
  History,
  Lock,
  Settings,
  UserRound,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CatalogPage } from "@/features/catalog/CatalogPage";
import { ClientStep } from "@/features/client/ClientStep";
import { ConfigurationPage } from "@/features/configuration/ConfigurationPage";
import { ConsumptionStep } from "@/features/consumption/ConsumptionStep";
import { QuotationStep } from "@/features/quotation/QuotationStep";
import { SizingStep } from "@/features/sizing/SizingStep";
import { HistoryPage } from "@/features/history/HistoryPage";
import { ProductsStep } from "@/features/products/ProductsStep";
import { cn } from "@/lib/utils";
import {
  adminSections,
  quotationSteps,
  type AdminSectionId,
  type QuotationStepId,
} from "@/lib/workflow";
import { useCotizacionStore } from "@/store/quotationStore";

const stepIcons = {
  client: UserRound,
  consumption: BarChart3,
  sizing: Zap,
  products: Boxes,
  quotation: FileText,
} satisfies Record<QuotationStepId, typeof UserRound>;

const adminIcons = {
  history: History,
  catalog: BookOpen,
  configuration: Settings,
} satisfies Record<AdminSectionId, typeof History>;

function renderStep(step: QuotationStepId) {
  const steps = {
    client: <ClientStep />,
    consumption: <ConsumptionStep />,
    sizing: <SizingStep />,
    products: <ProductsStep />,
    quotation: <QuotationStep />,
  } satisfies Record<QuotationStepId, React.ReactNode>;

  return steps[step];
}

function renderAdmin(section: AdminSectionId) {
  const sections = {
    history: <HistoryPage />,
    catalog: <CatalogPage />,
    configuration: <ConfigurationPage />,
  } satisfies Record<AdminSectionId, React.ReactNode>;

  return sections[section];
}

export function AppShell() {
  const {
    activeView,
    currentStep,
    maxUnlockedStep,
    systemType,
    client,
    goToAdmin,
    goToStep,
    nextStep,
    previousStep,
  } = useCotizacionStore();

  const activeStep = quotationSteps[currentStep - 1];
  const isWorkflow = activeView === "workflow";
  const canGoBack = isWorkflow && currentStep > 1;
  const canGoForward = isWorkflow && currentStep < quotationSteps.length;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_oklch(0.97_0.03_88),_transparent_30%),linear-gradient(135deg,_oklch(0.99_0.01_95),_oklch(0.97_0.01_210))] text-foreground">
      <div className="grid min-h-screen grid-cols-[280px_1fr]">
        <aside className="border-r border-border/70 bg-sidebar/95 px-4 py-5 shadow-sm backdrop-blur">
          <div className="mb-8 rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              JouleX
            </p>
            <h1 className="mt-2 text-xl font-semibold">Solar Quotations</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Desktop offline para propuestas fotovoltaicas.
            </p>
          </div>

          <nav className="space-y-6">
            <section>
              <p className="px-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Cotización activa
              </p>
              <div className="mt-3 space-y-1">
                {quotationSteps.map((step) => {
                  const Icon = stepIcons[step.id];
                  const isActive = isWorkflow && step.order === currentStep;
                  const isUnlocked = step.order <= maxUnlockedStep;
                  const isCompleted = step.order < maxUnlockedStep;

                  return (
                    <button
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-sidebar-foreground hover:bg-sidebar-accent",
                        !isUnlocked && "cursor-not-allowed opacity-50",
                      )}
                      disabled={!isUnlocked}
                      key={step.id}
                      onClick={() => goToStep(step.order)}
                      type="button"
                    >
                      <Icon className="size-4" />
                      <span className="flex-1">{step.label}</span>
                      {isCompleted ? (
                        <CheckCircle2 className="size-4" />
                      ) : isUnlocked ? (
                        <Circle className="size-4" />
                      ) : (
                        <Lock className="size-4" />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <p className="px-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Gestión
              </p>
              <div className="mt-3 space-y-1">
                {adminSections.map((section) => {
                  const Icon = adminIcons[section.id];
                  const isActive = activeView === section.id;

                  return (
                    <button
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent",
                      )}
                      key={section.id}
                      onClick={() => goToAdmin(section.id)}
                      type="button"
                    >
                      <Icon className="size-4" />
                      {section.label}
                    </button>
                  );
                })}
              </div>
            </section>
          </nav>
        </aside>

        <main className="flex min-w-0 flex-col">
          <header className="flex items-center justify-between border-b border-border/70 bg-background/75 px-8 py-4 backdrop-blur">
            <div>
              <p className="text-sm text-muted-foreground">
                {isWorkflow ? `Paso ${currentStep} de ${quotationSteps.length}` : "Gestión"}
              </p>
              <h2 className="text-2xl font-semibold">
                {isWorkflow
                  ? activeStep.label
                  : adminSections.find((section) => section.id === activeView)?.label}
              </h2>
            </div>
            <div className="text-right text-sm">
              <p className="font-medium">
                {client?.name || "Cliente sin asignar"}
              </p>
              <p className="text-muted-foreground">
                Sistema {systemType === "ongrid" ? "On-Grid" : systemType === "hybrid" ? "Híbrido" : "Off-Grid"}
              </p>
            </div>
          </header>

          <section className="flex-1 overflow-auto p-8">
            {isWorkflow ? renderStep(activeStep.id) : renderAdmin(activeView)}
          </section>

          <footer className="flex items-center justify-between border-t border-border/70 bg-background/80 px-8 py-4 backdrop-blur">
            <Button disabled={!canGoBack} onClick={previousStep} variant="outline">
              Anterior
            </Button>
            <p className="text-sm text-muted-foreground">
              {isWorkflow && ["client", "consumption", "sizing"].includes(activeStep.id)
                ? "Complete los datos requeridos para continuar."
                : "El avance validado se conectara con zod en la siguiente etapa."}
            </p>
            <Button
              disabled={!canGoForward}
              onClick={isWorkflow && ["client", "consumption", "sizing"].includes(activeStep.id) ? undefined : nextStep}
              type={isWorkflow && ["client", "consumption", "sizing"].includes(activeStep.id) ? "submit" : "button"}
              form={isWorkflow && ["client", "consumption", "sizing"].includes(activeStep.id) ? `${activeStep.id}-form` : undefined}
            >
              Siguiente
            </Button>
          </footer>
        </main>
      </div>
    </div>
  );
}
