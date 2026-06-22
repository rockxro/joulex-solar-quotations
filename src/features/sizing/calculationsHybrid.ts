import { months } from "@/lib/months";

export type HybridCalculationDetail = {
  month: string;
  consumption: number;
  panelGeneration: number;
  plantGeneration: number;
  dailyConsumption: number;
  dailyGeneration: number;
  dailyDirectSolarConsumption: number;
  dailySolarSurplus: number;
  dailyBatteryCharge: number;
  dailyInjection: number;
  dailyNightConsumption: number;
  dailyBatteryDischarge: number;
  dailyGridConsumption: number;
  inyeccionMes: number; // Keep these matched to output properties
  consumoRedMes: number;
  consumoSolarDirectoMes: number;
  descargaBateriaMes: number;
  ahorroSolarDirecto: number;
  ahorroBateria: number;
  creditoInyeccion: number;
  ahorroTotal: number;
  costoRed: number;
  coberturaEnergetica: number;
  coberturaEconomica: number;
  saldo: number;
  saldoAcumulado: number;
};

export type HybridResults = {
  detalles: HybridCalculationDetail[];
  totalesAnuales: {
    generacionPlanta: number;
    inyeccion: number;
    consumoRed: number;
    consumoSolarDirecto: number;
    descargaBateria: number;
    ahorroSolarDirecto: number;
    ahorroBateria: number;
    creditoInyeccion: number;
    ahorroTotal: number;
    costoRed: number;
    saldo: number;
    coberturaEnergetica: number;
    coberturaEconomica: number;
    consumoDiarioPromedio: number;
    autonomiaRealHoras: number;
    modulosNecesarios: number;
  };
};

export const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function calcularHibrido(params: {
  consumos: number[];
  generacionPorPanel: number[];
  numeroPaneles: number;
  diasLaborales: number;
  diasDescanso: number;
  pctConsumoLaboral: number;
  pctConsumoDescanso: number;
  precioCompra: number;
  precioInyeccion: number;
  // Batteries
  numModulosBateria: number;
  capacidadModuloBateriaKwh: number;
  dodBateria: number;
  horasAutonomiaDeseadas: number;
}): HybridResults {
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
    numModulosBateria,
    capacidadModuloBateriaKwh,
    dodBateria,
    horasAutonomiaDeseadas,
  } = params;

  const daytimeConsumptionFactor =
    (diasLaborales / 7) * pctConsumoLaboral +
    (diasDescanso / 7) * pctConsumoDescanso;

  const batteryUsableCapacity = capacidadModuloBateriaKwh * dodBateria * numModulosBateria;

  const detalles: HybridCalculationDetail[] = [];
  let accumulatedBalance = 0;

  // Annual aggregators
  let totalPlantGeneration = 0;
  let totalInjection = 0;
  let totalGridConsumption = 0;
  let totalDirectSolarConsumption = 0;
  let totalBatteryDischarge = 0;
  let totalDirectSolarSavings = 0;
  let totalBatterySavings = 0;
  let totalInjectionCredit = 0;
  let totalSavings = 0;
  let totalGridCost = 0;
  let totalBalance = 0;
  let totalOriginalConsumption = 0;

  // For daily consumption averaging
  let sumDailyConsumption = 0;

  for (let i = 0; i < 12; i++) {
    const month = months[i];
    const monthDays = daysInMonths[i];
    const consumptionMonth = consumos[i] || 0;
    const panelGen = generacionPorPanel[i] || 0;

    const plantGeneration = numeroPaneles * panelGen;

    // Convert to daily values
    const dailyConsumption = consumptionMonth / monthDays;
    sumDailyConsumption += dailyConsumption;
    const dailyGeneration = plantGeneration / monthDays;

    const dailyDaytimeConsumption = dailyConsumption * daytimeConsumptionFactor;
    const dailyDirectSolarConsumption = Math.min(dailyDaytimeConsumption, dailyGeneration);
    const dailySolarSurplus = dailyGeneration - dailyDirectSolarConsumption;

    const dailyBatteryCharge = Math.min(dailySolarSurplus, batteryUsableCapacity);
    const dailyInjection = dailySolarSurplus - dailyBatteryCharge;

    const dailyNightConsumption = dailyConsumption - dailyDirectSolarConsumption;
    const dailyBatteryDischarge = Math.min(dailyNightConsumption, dailyBatteryCharge);
    const dailyGridConsumption = dailyNightConsumption - dailyBatteryDischarge;

    // Scale to monthly
    const injectionMonth = dailyInjection * monthDays;
    const gridConsumptionMonth = dailyGridConsumption * monthDays;
    const directSolarConsumptionMonth = dailyDirectSolarConsumption * monthDays;
    const batteryDischargeMonth = dailyBatteryDischarge * monthDays;

    const ahorroSolarDirecto = directSolarConsumptionMonth * precioCompra;
    const ahorroBateria = batteryDischargeMonth * precioCompra;
    const creditoInyeccion = injectionMonth * precioInyeccion;
    const stepTotalSavings = ahorroSolarDirecto + ahorroBateria + creditoInyeccion;
    const gridCost = gridConsumptionMonth * precioCompra;
    const balance = creditoInyeccion - gridCost;

    accumulatedBalance += balance;

    const originalCost = consumptionMonth * precioCompra;
    const energyCoverage =
      consumptionMonth > 0 ? (directSolarConsumptionMonth + batteryDischargeMonth) / consumptionMonth : 0;
    const economicCoverage = originalCost > 0 ? stepTotalSavings / originalCost : 0;

    detalles.push({
      month,
      consumption: consumptionMonth,
      panelGeneration: panelGen,
      plantGeneration,
      dailyConsumption,
      dailyGeneration,
      dailyDirectSolarConsumption,
      dailySolarSurplus,
      dailyBatteryCharge,
      dailyInjection,
      dailyNightConsumption,
      dailyBatteryDischarge,
      dailyGridConsumption,
      inyeccionMes: injectionMonth,
      consumoRedMes: gridConsumptionMonth,
      consumoSolarDirectoMes: directSolarConsumptionMonth,
      descargaBateriaMes: batteryDischargeMonth,
      ahorroSolarDirecto,
      ahorroBateria,
      creditoInyeccion,
      ahorroTotal: stepTotalSavings,
      costoRed: gridCost,
      coberturaEnergetica: energyCoverage,
      coberturaEconomica: economicCoverage,
      saldo: balance,
      saldoAcumulado: accumulatedBalance,
    });

    totalPlantGeneration += plantGeneration;
    totalInjection += injectionMonth;
    totalGridConsumption += gridConsumptionMonth;
    totalDirectSolarConsumption += directSolarConsumptionMonth;
    totalBatteryDischarge += batteryDischargeMonth;
    totalDirectSolarSavings += ahorroSolarDirecto;
    totalBatterySavings += ahorroBateria;
    totalInjectionCredit += creditoInyeccion;
    totalSavings += stepTotalSavings;
    totalGridCost += gridCost;
    totalBalance += balance;
    totalOriginalConsumption += consumptionMonth;
  }

  // Battery Autonomy Calculator
  const averageDailyConsumption = sumDailyConsumption / 12;
  const averageHourlyConsumption = averageDailyConsumption / 24;
  const autonomyRealHours =
    averageHourlyConsumption > 0 ? batteryUsableCapacity / averageHourlyConsumption : 0;

  const requiredEnergy = averageHourlyConsumption * horasAutonomiaDeseadas;
  const modulosNecesarios =
    capacidadModuloBateriaKwh * dodBateria > 0
      ? Math.ceil(requiredEnergy / (capacidadModuloBateriaKwh * dodBateria))
      : 0;

  const annualOriginalCost = totalOriginalConsumption * precioCompra;
  const annualEnergyCoverage =
    totalOriginalConsumption > 0
      ? (totalDirectSolarConsumption + totalBatteryDischarge) / totalOriginalConsumption
      : 0;
  const annualEconomicCoverage =
    annualOriginalCost > 0 ? totalSavings / annualOriginalCost : 0;

  return {
    detalles,
    totalesAnuales: {
      generacionPlanta: totalPlantGeneration,
      inyeccion: totalInjection,
      consumoRed: totalGridConsumption,
      consumoSolarDirecto: totalDirectSolarConsumption,
      descargaBateria: totalBatteryDischarge,
      ahorroSolarDirecto: totalDirectSolarSavings,
      ahorroBateria: totalBatterySavings,
      creditoInyeccion: totalInjectionCredit,
      ahorroTotal: totalSavings,
      costoRed: totalGridCost,
      saldo: totalBalance,
      coberturaEnergetica: annualEnergyCoverage,
      coberturaEconomica: annualEconomicCoverage,
      consumoDiarioPromedio: averageDailyConsumption,
      autonomiaRealHoras: autonomyRealHours,
      modulosNecesarios: modulosNecesarios,
    },
  };
}
