/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { calculateEvmMetrics } from './evmService.ts';
import { ALBA_SAMPLE_DATASET } from './albaSampleDataset.ts';

export function runEvmUnitTests(): {
  allPassed: boolean;
  results: Array<{ testName: string; passed: boolean; expected: any; actual: any }>;
} {
  const results: Array<{ testName: string; passed: boolean; expected: any; actual: any }> = [];

  const res = calculateEvmMetrics(ALBA_SAMPLE_DATASET, 6);

  // 1. PV a la semana 6
  const pvMatches = Math.round(res.pv) === 2426666;
  results.push({
    testName: 'PV(6) == 2,426,666',
    passed: pvMatches,
    expected: 2426666,
    actual: Math.round(res.pv),
  });

  // 2. EV a la semana 6
  const evMatches = Math.round(res.ev) === 2023500;
  results.push({
    testName: 'EV(6) == 2,023,500',
    passed: evMatches,
    expected: 2023500,
    actual: Math.round(res.ev),
  });

  // 3. AC a la semana 6
  const acMatches = Math.round(res.ac) === 2234000;
  results.push({
    testName: 'AC(6) == 2,234,000',
    passed: acMatches,
    expected: 2234000,
    actual: Math.round(res.ac),
  });

  // 4. CPI == 0.91
  const cpiFormatted = res.cpi !== null ? res.cpi.toFixed(2) : '—';
  const cpiMatches = cpiFormatted === '0.91';
  results.push({
    testName: 'CPI == 0.91',
    passed: cpiMatches,
    expected: '0.91',
    actual: cpiFormatted,
  });

  // 5. SPI == 0.83
  const spiFormatted = res.spi !== null ? res.spi.toFixed(2) : '—';
  const spiMatches = spiFormatted === '0.83';
  results.push({
    testName: 'SPI == 0.83',
    passed: spiMatches,
    expected: '0.83',
    actual: spiFormatted,
  });

  // 6. EAC típico == 4,250,507
  const eacTipicoRounded = res.eacTipico !== null ? Math.round(res.eacTipico) : null;
  const eacMatches = eacTipicoRounded === 4250507;
  results.push({
    testName: 'EAC típico == 4,250,507',
    passed: eacMatches,
    expected: 4250507,
    actual: eacTipicoRounded,
  });

  // 7. TCPI == 1.13
  const tcpiFormatted = res.tcpi !== null ? res.tcpi.toFixed(2) : '—';
  const tcpiMatches = tcpiFormatted === '1.13';
  results.push({
    testName: 'TCPI == 1.13',
    passed: tcpiMatches,
    expected: '1.13',
    actual: tcpiFormatted,
  });

  // 8. ES == 5.22
  const esFormatted = res.es !== null ? res.es.toFixed(2) : '—';
  const esMatches = esFormatted === '5.22';
  results.push({
    testName: 'ES == 5.22',
    passed: esMatches,
    expected: '5.22',
    actual: esFormatted,
  });

  // 9. Manejo de división por cero con dataset vacío
  const emptyRes = calculateEvmMetrics(null, 6);
  const emptyHandled = emptyRes.cpi === null && emptyRes.spi === null && emptyRes.eacTipico === null;
  results.push({
    testName: 'Evita división entre cero en dataset vacío',
    passed: emptyHandled,
    expected: true,
    actual: emptyHandled,
  });

  // 10. Desglose de Cuentas de Control
  const hasControlAccounts = res.controlAccounts.length > 0;
  results.push({
    testName: 'Genera desglose por Cuentas de Control',
    passed: hasControlAccounts,
    expected: true,
    actual: res.controlAccounts.length,
  });

  const allPassed = results.every((r) => r.passed);
  return { allPassed, results };
}

// Ejecutar pruebas en terminal cuando se invoca directamente con tsx
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('evmService.test.ts')) {
  console.log('--- Ejecutando pruebas unitarias EVM (Caso ALBA S6) ---');
  const { allPassed, results } = runEvmUnitTests();
  results.forEach((r) => {
    const mark = r.passed ? '✓' : '✗';
    console.log(`${mark} ${r.testName} (esperado: ${r.expected}, obtenido: ${r.actual})`);
  });
  console.log(`\nResultado global: ${allPassed ? 'TODAS LAS PRUEBAS PASARON EXITOSAMENTE' : 'FALLARON ALGUNAS PRUEBAS'}`);
  if (!allPassed) {
    process.exit(1);
  }
}
