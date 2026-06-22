import { months } from "@/lib/months";

export type OnGridCalculationDetail = {
  month: string;
  consumption: number;
  panelGeneration: number;
  plantGeneration: number;
  daytimeConsumption: number;
  solarConsumption: number;
  injection: number;
  gridConsumption: number;
  solarConsumptionSavings: number;
  injectionCredit: number;
  totalSavings: number;
  gridCost: number;
  energyCoverage: number; // Fraction (0 to 1)
  economicCoverage: number;  // Fraction (0 to 1+)
  balance: number;
  accumulatedBalance: number;
};

export type OnGridResults = {
  detalles: OnGridCalculationDetail[];
  totalesAnuales: {
    generacionPlanta: number;
    consumoSolar: number;
    inyeccion: number;
    ahorroConsumoSolar: number;
    creditoInyeccion: number;
    ahorroTotal: number;
    costoRed: number;
    saldo: number;
    coberturaEnergetica: number;
    coberturaEconomica: number;
  };
};

export function calcularOnGrid(params: {
  consumos: number[]; // 12 values
  generacionPorPanel: number[]; // 12 values
  numeroPaneles: number;
  diasLaborales: number;
  diasDescanso: number;
  pctConsumoLaboral: number;  // Fraction (0 to 1)
  pctConsumoDescanso: number; // Fraction (0 to 1)
  precioCompra: number;
  precioInyeccion: number;
}): OnGridResults {
  const {
    consumos,
    generacionPorPanel,
    numeroPaneles,
    diasLaborales,
    diasDescanso,
    pctConsumoLaboral,
    pctConsumoDescanso,
    precioCompra,
    precioInyeccion,
  } = params;

  // 1. Calculate daytime consumption factor
  const daytimeConsumptionFactor =
    (diasLaborales / 7) * pctConsumoLaboral +
    (diasDescanso / 7) * pctConsumoDescanso;

  const detalles: OnGridCalculationDetail[] = [];
  let accumulatedBalance = 0;

  // Annual accumulated totals
  let totalPlantGeneration = 0;
  let totalSolarConsumption = 0;
  let totalInjection = 0;
  let totalSolarConsumptionSavings = 0;
  let totalInjectionCredit = 0;
  let totalSavings = 0;
  let totalGridCost = 0;
  let totalBalance = 0;
  let totalOriginalConsumption = 0;

  for (let i = 0; i < 12; i++) {
    const month = months[i];
    const consumption = consumos[i] || 0;
    const panelGen = generacionPorPanel[i] || 0;

    const plantGeneration = numeroPaneles * panelGen;
    const daytimeConsumption = consumption * daytimeConsumptionFactor;
    const solarConsumption = Math.min(daytimeConsumption, plantGeneration);
    const injection = plantGeneration - solarConsumption;
    const gridConsumption = consumption - solarConsumption;

    const solarConsumptionSavings = solarConsumption * precioCompra;
    const injectionCredit = injection * precioInyeccion;
    const stepTotalSavings = solarConsumptionSavings + injectionCredit;
    const gridCost = gridConsumption * precioCompra;
    const balance = injectionCredit - gridCost;

    accumulatedBalance += balance;

    const originalCost = consumption * precioCompra;
    const energyCoverage = consumption > 0 ? solarConsumption / consumption : 0;
    const economicCoverage = originalCost > 0 ? stepTotalSavings / originalCost : 0;

    detalles.push({
      month,
      consumption,
      panelGeneration: panelGen,
      plantGeneration,
      daytimeConsumption,
      solarConsumption,
      injection,
      gridConsumption,
      solarConsumptionSavings,
      injectionCredit,
      totalSavings: stepTotalSavings,
      gridCost,
      energyCoverage,
      economicCoverage,
      balance,
      accumulatedBalance,
    });

    // Annual sums
    totalPlantGeneration += plantGeneration;
    totalSolarConsumption += solarConsumption;
    totalInjection += injection;
    totalSolarConsumptionSavings += solarConsumptionSavings;
    totalInjectionCredit += injectionCredit;
    totalSavings += stepTotalSavings;
    totalGridCost += gridCost;
    totalBalance += balance;
    totalOriginalConsumption += consumption;
  }

  const annualOriginalCost = totalOriginalConsumption * precioCompra;
  const annualEnergyCoverage =
    totalOriginalConsumption > 0 ? totalSolarConsumption / totalOriginalConsumption : 0;
  const annualEconomicCoverage =
    annualOriginalCost > 0 ? totalSavings / annualOriginalCost : 0;

  return {
    detalles,
    totalesAnuales: {
      generacionPlanta: totalPlantGeneration,
      consumoSolar: totalSolarConsumption,
      inyeccion: totalInjection,
      ahorroConsumoSolar: totalSolarConsumptionSavings,
      creditoInyeccion: totalInjectionCredit,
      ahorroTotal: totalSavings,
      costoRed: totalGridCost,
      saldo: totalBalance,
      coberturaEnergetica: annualEnergyCoverage,
      coberturaEconomica: annualEconomicCoverage,
    },
  };
}
