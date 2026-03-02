import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [childAge, setChildAge] = useState(0);
  const [targetAmount, setTargetAmount] = useState(10000);
  const [returnRate, setReturnRate] = useState(0.06);
  const [considerInflation, setConsiderInflation] = useState(false);

  // Derived Calculation
  const { monthlyContribution, data, milestones } = useMemo(() => {
    // Constants
    const netRateAccumulation = 1 + returnRate;
    const inflationRate = 0.02;

    // Target is targetAmount at age 18
    const targetAge = 18;
    const yearsAccumulation = targetAge - childAge;

    const futureTarget = considerInflation ? targetAmount * Math.pow(1 + inflationRate, yearsAccumulation) : targetAmount;

    // Calculate Required Monthly Contribution
    const i1 = Math.pow(netRateAccumulation, 1 / 12) - 1;
    const monthsAccumulation = yearsAccumulation * 12;

    let calcedContribution = 0;
    if (monthsAccumulation > 0) {
      // FV factor for annuity due (start of month)
      const fvFactor = ((Math.pow(1 + i1, monthsAccumulation) - 1) / i1) * (1 + i1);
      calcedContribution = futureTarget / fvFactor;
    }

    // Generate Data Points
    const dataPoints = [];
    let currentWealth = 0;

    const milestonesVals = {
      at5: 0,
      at10: 0,
      at15: 0,
      at18: targetAmount
    };

    const growthFactor = Math.pow(netRateAccumulation, 1 / 12);

    for (let age = childAge; age < targetAge; age++) {
      // Calculate 12 months
      for (let m = 0; m < 12; m++) {
        // Start of month contribution
        currentWealth += calcedContribution;
        // Growth
        currentWealth *= growthFactor;
      }

      const displayAge = age + 1;

      // Snapshot for milestones (End of Year)
      if (displayAge === 5) milestonesVals.at5 = currentWealth;
      if (displayAge === 10) milestonesVals.at10 = currentWealth;
      if (displayAge === 15) milestonesVals.at15 = currentWealth;

      dataPoints.push({
        age: displayAge,
        wealth: Math.round(currentWealth),
      });
    }

    // Fix milestone at targetAge to be exactly the target (avoid float drift in display)
    milestonesVals.at18 = currentWealth;

    return {
      monthlyContribution: calcedContribution,
      data: dataPoints,
      milestones: milestonesVals
    };
  }, [childAge, targetAmount, returnRate, considerInflation]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-white text-[#222] font-sans p-8 flex flex-col items-center">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#8bbd2a] mb-6">Mittelfristiges Sparen bis 18</h1>
        <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-8 text-lg font-medium text-gray-700">
          <p>
            Früh anfangen heißt: <span className="font-['Caveat'] text-3xl font-bold">Träume möglich machen.</span>
          </p>
        </div>
      </header>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Controls */}
        <div className="lg:col-span-4 space-y-8">

          {/* Target Amount Slider */}
          <div className="bg-white p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <label className="text-sm font-bold tracking-wider text-[#1a1a1a]">GEWÜNSCHTER BETRAG</label>
            </div>
            <div className="text-center mb-6">
              <span className="text-3xl font-bold text-[#8bbd2a]">{targetAmount.toLocaleString('de-DE')} €</span>
            </div>
            <input
              type="range"
              min="1000"
              max="50000"
              step="500"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8bbd2a]"
              value={targetAmount}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
            />
            <div className="flex justify-between mt-2 text-xs text-gray-300">
              <span>1.000 €</span><span>50.000 €</span>
            </div>

            <div className="mt-8 space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input
                    type="checkbox"
                    className="peer appearance-none w-5 h-5 border border-gray-300 rounded-[4px] checked:bg-[#007aff] checked:border-[#007aff] transition-colors"
                    checked={considerInflation}
                    onChange={(e) => setConsiderInflation(e.target.checked)}
                  />
                  {considerInflation && (
                    <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className="text-[13px] font-medium text-[#4a4a4a]">Inflation berücksichtigen (2% p.a.)</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input
                    type="checkbox"
                    className="peer appearance-none w-5 h-5 border border-gray-300 rounded-[4px] checked:bg-[#007aff] checked:border-[#007aff] transition-colors"
                    checked={returnRate === 0.04}
                    onChange={() => setReturnRate(0.04)}
                  />
                  {returnRate === 0.04 && (
                    <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className="text-[13px] font-medium text-[#4a4a4a]">Renditeannahme 4% p.a.</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input
                    type="checkbox"
                    className="peer appearance-none w-5 h-5 border border-gray-300 rounded-[4px] checked:bg-[#007aff] checked:border-[#007aff] transition-colors"
                    checked={returnRate === 0.06}
                    onChange={() => setReturnRate(0.06)}
                  />
                  {returnRate === 0.06 && (
                    <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className="text-[13px] font-medium text-[#4a4a4a]">Renditeannahme 6% p.a.</span>
              </label>
            </div>
          </div>

          {/* Age Slider */}
          <div className="bg-white px-8 py-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-medium tracking-wider text-[#1a1a1a]">SPAREN AB ALTER</label>
            </div>
            <div className="text-center mb-4">
              <span className="text-3xl font-bold text-[#8bbd2a]">{childAge} J.</span>
            </div>
            <input
              type="range"
              min="0"
              max="18"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8bbd2a]"
              value={childAge}
              onChange={(e) => setChildAge(Number(e.target.value))}
            />
            <div className="flex justify-between mt-2 text-xs text-gray-300">
              <span>0</span><span>18</span>
            </div>
          </div>

          {/* Contribution Display */}
          <div className="bg-white px-8 py-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 shrink-0">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-medium tracking-wider text-[#1a1a1a]">BENÖTIGTER SPARBEITRAG</label>
            </div>
            <div className="text-center mb-2">
              <span className="text-3xl font-bold text-[#8bbd2a]">{Math.round(monthlyContribution).toLocaleString('de-DE')} €</span>
            </div>
          </div>

        </div>

        {/* Right Column: Chart & Results */}
        <div className="lg:col-span-8 bg-white p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col h-full min-h-[500px]">
          <div className="flex-1 flex flex-col">
            <h3 className="text-center text-sm font-bold text-[#1a1a1a] mb-2 uppercase tracking-widest">Beispielrechnung für den Vermögensaufbau</h3>
            <p className="text-center text-[10px] leading-relaxed text-gray-400 mb-6 max-w-3xl mx-auto">
              Die Berechnung zeigt das mögliche angesparte Kapital bis zum 18. Lebensjahr. Es wird von einer jährlichen Wertentwicklung von <strong>{Math.round(returnRate * 100)}%</strong> ausgegangen. Es handelt sich um eine mathematische Berechnung. Es liegt kein konkretes Finanzprodukt zu Grunde.
            </p>

            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8bbd2a" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8bbd2a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis
                    type="number"
                    domain={[0, 18]}
                    dataKey="age"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#666', fontSize: 12 }}
                    ticks={[0, 5, 10, 15, 18]}
                  />
                  <YAxis
                    width={100}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value.toLocaleString('de-DE')} €`}
                    tick={{ fill: '#666', fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                    labelFormatter={(label) => `Alter: ${label} Jahre`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area
                    type="linear"
                    dataKey="wealth"
                    stroke="#8bbd2a"
                    strokeWidth={3}
                    fill="url(#colorWealth)"
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Milestones */}
          <div className="mt-8">
            <h4 className="text-center text-gray-500 text-xs uppercase tracking-widest mb-4 font-semibold">Vermögenswert im Alter von ...</h4>
            <div className="grid grid-cols-4 gap-4">
              {[
                { age: 5, val: milestones.at5 },
                { age: 10, val: milestones.at10 },
                { age: 15, val: milestones.at15 },
                { age: 18, val: milestones.at18 }
              ].map((m, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 text-center flex flex-col justify-center h-full">
                  <div className="text-[#8bbd2a] font-bold text-lg md:text-xl truncate leading-none mb-1">
                    {formatCurrency(m.val).replace('€', '').trim()} €
                  </div>
                  <div className="text-gray-400 text-xs font-medium uppercase">
                    {m.age} Jahren
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
