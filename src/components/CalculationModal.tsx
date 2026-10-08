// 공통가설공사_자동내역 - CalculationModal.tsx
import React, { useMemo, useState } from 'react'
import { PHASE1_FORMULA, getPhase2Area, autoMixContainers, CONTAINER_A, CONTAINER_B } from '../lib/standardEstimate'

export default function CalculationModal({ item, projectContext, standardTable, onClose, onApply }: any) {
  const [step, setStep] = useState<1|2>(1)
  const [installType, setInstallType] = useState<'rent'|'install'>('rent')
  const [directLabor, setDirectLabor] = useState(35)
  const [rentA, setRentA] = useState(350000)
  const [rentB, setRentB] = useState(550000)
  const [a, setA] = useState(6)
  const [b, setB] = useState(1)

  const requiredArea = useMemo(() => {
    if (step === 1) return PHASE1_FORMULA(projectContext.grossFloorArea)
    const row = getPhase2Area(directLabor, standardTable)
    return row[item.target] || 0
  }, [step, projectContext.grossFloorArea, directLabor])

  // 자동 최적화
  const handleAuto = () => {
    const mix = autoMixContainers(requiredArea, rentA, rentB)
    setA(mix.a)
    setB(mix.b)
  }

  // requiredArea 변경시 자동 맞춤
  React.useEffect(() => { handleAuto() }, [requiredArea])

  const totalArea = a*18 + b*27
  const monthly = a*rentA + b*rentB
  const isEnough = totalArea >= requiredArea

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">{item.name} 산출식 - {item.id}</h2>
            <button onClick={onClose}>✕</button>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
            <div className="bg-zinc-100 p-3 rounded">연면적<br/><b>{projectContext.grossFloorArea.toLocaleString()}㎡</b></div>
            <div className="bg-zinc-100 p-3 rounded">건물용도<br/><b>{projectContext.buildingUse}</b></div>
            <div className="bg-zinc-100 p-3 rounded">공사기간<br/><b>{projectContext.durationMonths}개월</b></div>
          </div>

          <div className="flex gap-2 mb-4">
            <button onClick={()=>setStep(1)} className={`px-4 py-2 rounded-full text-sm ${step===1?'bg-zinc-900 text-white':'bg-zinc-100'}`}>1단계: 연면적 가견적</button>
            <button onClick={()=>setStep(2)} className={`px-4 py-2 rounded-full text-sm ${step===2?'bg-zinc-900 text-white':'bg-zinc-100'}`}>2단계: 직접노무비 품셈</button>
          </div>

          {step===1 && (
            <div className="bg-zinc-50 p-4 rounded-xl mb-4 text-sm">
              <div className="font-bold mb-2">필요 면적 산출 과정</div>
              <div className="bg-white p-2 rounded font-mono text-xs mb-2">IF(연면적 &lt;= 200, 6, IF(&lt;=1000, 30, IF(&lt;=3000, 63, IF(&lt;=6000, 76, 130))))</div>
              <div className="space-y-1">
                <div className="flex justify-between"><span>연면적 ≤ 200</span><span>6㎡</span></div>
                <div className="flex justify-between"><span>연면적 ≤ 1,000</span><span>30㎡</span></div>
                <div className="flex justify-between"><span>연면적 ≤ 3,000</span><span>63㎡</span></div>
                <div className="flex justify-between"><span>연면적 ≤ 6,000</span><span>76㎡</span></div>
                <div className="flex justify-between bg-zinc-900 text-white px-2 py-1 rounded"><span>연면적 &gt; 6,000 → 현재</span><span>130㎡</span></div>
              </div>
              <div className="mt-3 font-bold">requiredArea({projectContext.grossFloorArea.toLocaleString()}) = {requiredArea}㎡</div>
            </div>
          )}

          {step===2 && (
            <div className="bg-zinc-50 p-4 rounded-xl mb-4">
              <div className="font-bold text-sm mb-2">직접노무비 입력 (가설물 제외)</div>
              <input type="number" value={directLabor} onChange={e=>setDirectLabor(Number(e.target.value))} className="border p-2 rounded w-32" /> 억원
              <div className="text-xs mt-2">해당 구간: {item.target} 면적 {requiredArea}㎡ 적용</div>
            </div>
          )}

          <div className="mb-2 font-bold text-sm flex justify-between">
            <span>컨테이너 혼합배치</span>
            <button onClick={handleAuto} className="text-xs bg-zinc-900 text-white px-3 py-1 rounded-full">⚡ 자동 최적화</button>
          </div>

          <div className="flex gap-2 mb-4">
            <button onClick={()=>{ alert('설치형은 추후 구현 예정입니다. 현재는 임대형만 사용 가능합니다.'); setInstallType('rent')}} className="flex-1 border border-dashed border-zinc-300 rounded-xl p-2 text-sm text-zinc-400">
              🔒 설치형 <span className="bg-zinc-200 text-[10px] px-2 py-0.5 rounded-full ml-1">준비중</span>
            </button>
            <button onClick={()=>setInstallType('rent')} className="flex-1 bg-zinc-900 text-white rounded-xl p-2 text-sm">
              ● 임대형 <span className="bg-green-500 text-[10px] px-2 py-0.5 rounded-full ml-1">현재 사용중</span>
            </button>
          </div>

          {installType==='install' ? (
            <div className="border-2 border-dashed rounded-xl p-8 text-center opacity-60">
              <div className="text-3xl mb-2">🚧</div>
              <div className="font-bold">설치형은 추후 구현 예정</div>
              <div className="text-xs text-zinc-500">현재는 임대형만 사용 가능합니다.</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="border rounded-xl p-3">
                  <div className="text-sm font-bold">3.0 × 6.0</div>
                  <div className="text-xs text-zinc-500">18㎡ / 동</div>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={()=>setA(Math.max(0,a-1))} className="w-7 h-7 border rounded-full">-</button>
                    <span className="w-8 text-center">{a}</span>
                    <button onClick={()=>setA(a+1)} className="w-7 h-7 border rounded-full">+</button>
                  </div>
                  <input value={rentA} onChange={e=>setRentA(Number(e.target.value))} className="mt-2 border rounded w-full p-1 text-sm" />
                </div>
                <div className="border rounded-xl p-3">
                  <div className="text-sm font-bold">3.0 × 9.0</div>
                  <div className="text-xs text-zinc-500">27㎡ / 동</div>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={()=>setB(Math.max(0,b-1))} className="w-7 h-7 border rounded-full">-</button>
                    <span className="w-8 text-center">{b}</span>
                    <button onClick={()=>setB(b+1)} className="w-7 h-7 border rounded-full">+</button>
                  </div>
                  <input value={rentB} onChange={e=>setRentB(Number(e.target.value))} className="mt-2 border rounded w-full p-1 text-sm" />
                </div>
              </div>
              <div className={`p-3 rounded-xl text-sm ${isEnough?'bg-green-50 text-green-700':'bg-red-50 text-red-700'}`}>
                totalArea = {a}×18 + {b}×27 = <b>{totalArea}㎡</b> / 필요 {requiredArea}㎡ · {isEnough?`충족 +${totalArea-requiredArea}㎡`:`부족 ${requiredArea-totalArea}㎡`}
              </div>
              <div className="mt-3 text-sm flex justify-between">
                <span>월 임대료 합계</span><b>{monthly.toLocaleString()}원</b>
              </div>
            </>
          )}

          <div className="flex gap-2 mt-6">
            <button onClick={onClose} className="flex-1 border rounded-full py-2">취소</button>
            <button onClick={()=>onApply({ a,b,totalArea,requiredArea,monthly })} className="flex-1 bg-zinc-900 text-white rounded-full py-2">적용</button>
          </div>
        </div>
      </div>
    </div>
  )
}
