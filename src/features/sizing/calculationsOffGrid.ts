import { months } from "@/lib/months";
import { daysInMonths } from "./calculationsHybrid";

export type OffGridCalculationDetail = {
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
  dailyCurtailment: number;
  dailyNightConsumption: number;
  dailyBatteryDischarge: number;
  dailyDeficit: number;
  inyeccionMes: number; // Keeping matched output property names for simplicity in dashboard
  consumoRedMes: number;
  consumoSolarDirectoMes: number;
  descargaBateriaMes: number;
  recorteMes: number;
  deficitMes: number;
  ahorroSolarDirecto: number;
  ahorroBateria: number;
  creditoInyeccion: number;
  ahorroTotal: number;
  costoRed: number;
  costoRespaldo: number;
  coberturaEnergetica: number;
  coberturaEconomica: number;
  saldo: number;
  saldoAcumulado: number;
};

export type OffGridResults = {
  detalles: OffGridCalculationDetail[];
  totalesAnuales: {
    generacionPlanta: number;
    inyeccion: number;
    consumoRed: number;
    consumoSolarDirecto: number;
    descargaBateria: number;
    recorte: number;
    deficit: number;
    ahorroSolarDirecto: number;
    ahorroBateria: number;
    creditoInyeccion: number;
    ahorroTotal: number;
    costoRed: number;
    costoRespaldo: number;
    saldo: number;
    coberturaEnergetica: number;
    coberturaEconomica: number;
    consumoDiarioPromedio: number;
    autonomiaRealHoras: number;
    modulosNecesarios: number;
  };
};

export function calcularOffGrid(params: {
  consumos: number[];
  generacionPorPanel: number[];
  numeroPaneles: number;
  diasLaborales: number;
  diasDescanso: number;
  pctConsumoLaboral: number;
  pctConsumoDescanso: number;
  precioCompra: number;
  // Batteries
  numModulosBateria: number;
  capacidadModuloBateriaKwh: number;
  dodBateria: number;
  horasAutonomiaDeseadas: number;
}): OffGridResults {
  const {
    consumos,
    generacionPorPanel,
    numeroPaneles,
    diasLaborales,
    diasDescanso,
    pctConsumoLaboral,
    pctConsumoDescanso,
    precioCompra,
    numModulosBateria,
    capacidadModuloBateriaKwh,
    dodBateria,
    horasAutonomiaDeseadas,
  } = params;

  const daytimeConsumptionFactor =
    (diasLaborales / 7) * pctConsumoLaboral +
    (diasDescanso / 7) * pctConsumoDescanso;

  const batteryUsableCapacity = capacidadModuloBateriaKwh * dodBateria * numModulosBateria;

  const detalles: OffGridCalculationDetail[] = [];
  let accumulatedBalance = 0;

  // Annual aggregators
  let totalPlantGeneration = 0;
  let totalDirectSolarConsumption = 0;
  let totalBatteryDischarge = 0;
  let totalCurtailment = 0;
  let totalDeficit = 0;
  let totalDirectSolarSavings = 0;
  let totalBatterySavings = 0;
  let totalSavings = 0;
  let totalBackupCost = 0;
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
    const dailyInjection = 0; // Off-grid: no injection
    const dailyCurtailment = dailySolarSurplus - dailyBatteryCharge;

    const dailyNightConsumption = dailyConsumption - dailyDirectSolarConsumption;
    const dailyBatteryDischarge = Math.min(dailyNightConsumption, dailyBatteryCharge);
    const dailyDeficit = dailyNightConsumption - dailyBatteryDischarge;

    // Scale to monthly
    const injectionMonth = 0;
    const gridConsumptionMonth = 0;
    const directSolarConsumptionMonth = dailyDirectSolarConsumption * monthDays;
    const batteryDischargeMonth = dailyBatteryDischarge * monthDays;
    const curtailmentMonth = dailyCurtailment * monthDays;
    const deficitMonth = dailyDeficit * monthDays;

    const ahorroSolarDirecto = directSolarConsumptionMonth * precioCompra;
    const ahorroBateria = batteryDischargeMonth * precioCompra;
    const stepTotalSavings = ahorroSolarDirecto + ahorroBateria;
    const backupCost = deficitMonth * precioCompra;
    const balance = -backupCost;

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
      dailyCurtailment,
      dailyNightConsumption,
      dailyBatteryDischarge,
      dailyDeficit,
      inyeccionMes: injectionMonth,
      consumoRedMes: gridConsumptionMonth,
      consumoSolarDirectoMes: directSolarConsumptionMonth,
      descargaBateriaMes: batteryDischargeMonth,
      recorteMes: curtailmentMonth,
      deficitMes: deficitMonth,
      ahorroSolarDirecto,
      ahorroBateria,
      creditoInyeccion: 0,
      ahorroTotal: stepTotalSavings,
      costoRed: 0,
      costoRespaldo: backupCost,
      coberturaEnergetica: energyCoverage,
      coberturaEconomica: economicCoverage,
      saldo: balance,
      saldoAcumulado: accumulatedBalance,
    });

    totalPlantGeneration += plantGeneration;
    totalDirectSolarConsumption += directSolarConsumptionMonth;
    totalBatteryDischarge += batteryDischargeMonth;
    totalCurtailment += curtailmentMonth;
    totalDeficit += deficitMonth;
    totalDirectSolarSavings += ahorroSolarDirecto;
    totalBatterySavings += ahorroBateria;
    totalSavings += stepTotalSavings;
    totalBackupCost += backupCost;
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
      inyeccion: 0,
      consumoRed: 0,
      consumoSolarDirecto: totalDirectSolarConsumption,
      descargaBateria: totalBatteryDischarge,
      recorte: totalCurtailment,
      deficit: totalDeficit,
      ahorroSolarDirecto: totalDirectSolarSavings,
      ahorroBateria: totalBatterySavings,
      creditoInyeccion: 0,
      ahorroTotal: totalSavings,
      costoRed: 0,
      costoRespaldo: totalBackupCost,
      saldo: totalBalance,
      coberturaEnergetica: annualEnergyCoverage,
      coberturaEconomica: annualEconomicCoverage,
      consumoDiarioPromedio: averageDailyConsumption,
      autonomiaRealHoras: autonomyRealHours,
      modulosNecesarios: modulosNecesarios,
    },
  };
}
