// 공통가설공사_자동내역 - 2026-10-08 최종
// 1단계: 연면적 기준, 2단계: 표준품셈 2-1-2 직접노무비 기준

export const CONTAINER_A = { spec: '3.0×6.0', area: 18, rent: 350000 }
export const CONTAINER_B = { spec: '3.0×9.0', area: 27, rent: 550000 }

export const PHASE1_FORMULA = (grossArea: number): number => {
  if (grossArea <= 200) return 6
  if (grossArea <= 1000) return 30
  if (grossArea <= 3000) return 63
  if (grossArea <= 6000) return 76
  return 130
}

export function getPhase2Area(directLaborHundredMillion: number, table: any[]) {
  const found = table.find(r => directLaborHundredMillion >= r.range[0] && directLaborHundredMillion < r.range[1])
  return found || table[table.length - 1]
}

export type MixResult = { a: number; b: number; total: number; waste: number; cost: number }

export function autoMixContainers(requiredArea: number, rentA = 350000, rentB = 550000): MixResult {
  let best: MixResult | null = null
  for (let a = 0; a <= 20; a++) {
    for (let b = 0; b <= 20; b++) {
      if (a === 0 && b === 0) continue
      const total = a * 18 + b * 27
      if (total < requiredArea) continue
      const waste = total - requiredArea
      const cost = a * rentA + b * rentB
      if (!best || waste < best.waste || (waste === best.waste && cost < best.cost)) {
        best = { a, b, total, waste, cost }
      }
    }
  }
  return best || { a: 0, b: 0, total: 0, waste: 0, cost: 0 }
}
