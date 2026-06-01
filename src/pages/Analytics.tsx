import { useQuery } from '@tanstack/react-query';
import { searchCompanies } from '@/services/companies';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  LabelList
} from 'recharts';
import {
  TrendingUp,
  Loader2,
  BarChart3,
  DollarSign,
  Users,
  Compass,
  PieChartIcon,
  Percent
} from 'lucide-react';
import { formatCompactNumber, formatCurrency } from '@/lib/utils';
import { useFilterStore } from '@/store/filterStore';

export function Analytics() {
  const { query, selectedIndustries, minFunding, maxFunding, minHeadcount, maxHeadcount } = useFilterStore();

  // Load companies list to calculate dynamic charts
  const { data: searchData, isLoading } = useQuery({
    queryKey: ['companiesSearch', query, selectedIndustries, minFunding, maxFunding, minHeadcount, maxHeadcount],
    queryFn: () =>
      searchCompanies({
        query,
        industry: selectedIndustries.join(','),
        min_funding: minFunding,
        min_headcount: minHeadcount,
        count: 50 // Pull larger batch for realistic aggregates
      }),
  });

  const companies = searchData?.results ?? [];

  // 1. Calculations: Median Headcount, Total Funding, High-Growth Ratio
  const totalHeadcountSum = companies.reduce((acc, c) => acc + c.employee_count, 0);
  const totalFundingSum = companies.reduce((acc, c) => acc + (c.total_funding_usd ?? 0), 0);
  
  const highGrowthCompaniesCount = companies.filter((c) => {
    const annualG = c.employee_growth_percentages?.find((g) => g.timespan === 'YEAR')?.percentage ?? 0;
    return annualG >= 20;
  }).length;
  
  const highGrowthRatio = companies.length > 0
    ? Math.round((highGrowthCompaniesCount / companies.length) * 100)
    : 0;

  // 2. Growth Brackets Aggregates (Bar Chart)
  // Brackets: High (>30% YoY), Moderate (10% to 30%), Stable (0% to 10%), Declining (<0%)
  const getGrowthBracketsData = () => {
    let high = 0;
    let moderate = 0;
    let stable = 0;
    let declining = 0;

    companies.forEach((c) => {
      const g = c.employee_growth_percentages?.find((p) => p.timespan === 'YEAR')?.percentage ?? 0;
      if (g > 30) high++;
      else if (g >= 10) moderate++;
      else if (g >= 0) stable++;
      else declining++;
    });

    return [
      { name: 'Declining (<0%)', Companies: declining, fill: '#FF5D73' },
      { name: 'Stable (0-10%)', Companies: stable, fill: '#B0B7C3' },
      { name: 'Moderate (10-30%)', Companies: moderate, fill: '#00D4FF' },
      { name: 'High Growth (>30%)', Companies: high, fill: '#7C5CFC' },
    ];
  };

  // 3. Industry Breakdown (Donut Chart)
  const getIndustryDonutData = () => {
    const industriesMap: Record<string, number> = {};
    companies.forEach((c) => {
      const ind = c.industry || 'Other';
      industriesMap[ind] = (industriesMap[ind] || 0) + 1;
    });

    // Color tokens
    const COLORS = ['#7C5CFC', '#00D4FF', '#00E676', '#FFB547', '#FF5D73', '#9E9E9E'];

    return Object.entries(industriesMap)
      .map(([name, value], idx) => ({
        name,
        value,
        color: COLORS[idx % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  };

  // 4. Capital Efficiency Scatter Plot (Headcount scale vs Total Funding USD)
  const getCapitalEfficiencyData = () => {
    return companies.map((c) => ({
      name: c.name,
      Funding: c.total_funding_usd ?? 0, // In millions USD
      Headcount: c.employee_count,
      Growth: c.employee_growth_percentages?.find((g) => g.timespan === 'YEAR')?.percentage ?? 0,
    }));
  };

  const barData = getGrowthBracketsData();
  const pieData = getIndustryDonutData();
  const scatterData = getCapitalEfficiencyData();

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-[26px] md:text-[32px] font-black tracking-tight leading-none text-white">
          Executive Insights
        </h1>
        <p className="text-[13.5px] text-text-secondary mt-2">
          Capital efficiency analysis, growth brackets segmentation, and sector coverage breakdown.
        </p>
      </div>

      {isLoading ? (
        <div className="py-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : companies.length === 0 ? (
        <div className="py-24 text-center text-text-secondary glass-panel rounded-2xl p-8 max-w-xl mx-auto shadow-md">
          <BarChart3 className="w-10 h-10 opacity-30 text-accent mb-4 mx-auto animate-pulse" />
          <h4 className="text-[14px] font-bold text-white mb-1.5">Analytics Matrix is Empty</h4>
          <p className="text-[12px] max-w-xs leading-relaxed mx-auto">
            Widen your search filters on the Discover tab to accumulate target companies for diagnostic charts.
          </p>
        </div>
      ) : (
        <>
          {/* --- TOP ROW SUMMARY CARDS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Medians / Headcount */}
            <div className="glass-panel rounded-2xl p-5 flex items-center justify-between shadow-md">
              <div className="flex flex-col">
                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">
                  Aggregated Headcount
                </span>
                <span className="text-[22px] md:text-[25px] font-black text-white font-mono mt-1.5 leading-none">
                  {formatCompactNumber(totalHeadcountSum)}
                </span>
                <span className="text-[9.5px] text-text-secondary mt-1">Across current active filtered set</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Funding Sum */}
            <div className="glass-panel rounded-2xl p-5 flex items-center justify-between shadow-md">
              <div className="flex flex-col">
                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">
                  Aggregated Capital
                </span>
                <span className="text-[22px] md:text-[25px] font-black text-white font-mono mt-1.5 leading-none">
                  {formatCurrency(totalFundingSum * 1_000_000)}
                </span>
                <span className="text-[9.5px] text-text-secondary mt-1">Excluding bootstrapped startups</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/20 text-success flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            {/* Growth Ratio */}
            <div className="glass-panel rounded-2xl p-5 flex items-center justify-between shadow-md">
              <div className="flex flex-col">
                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">
                  YoY Hyper Growth Ratio
                </span>
                <span className="text-[22px] md:text-[25px] font-black text-white font-mono mt-1.5 leading-none">
                  {highGrowthRatio}%
                </span>
                <span className="text-[9.5px] text-text-secondary mt-1">Startups growing &gt;20% annually</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 text-warning flex items-center justify-center">
                <Percent className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* --- MIDDLE ROW DUAL CHARTS GRID --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Growth Distribution Bar Chart */}
            <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4 shadow-md">
              <div>
                <h3 className="text-[14px] font-extrabold text-white flex items-center gap-2">
                  <TrendingUp className="w-4.5 h-4.5 text-accent" />
                  <span>YoY Growth Distribution</span>
                </h3>
                <p className="text-[10.5px] text-text-secondary mt-0.5">Segmenting startups into annual growth brackets</p>
              </div>

              <div className="w-full h-[250px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      stroke="#B0B7C3"
                      fontSize={9.5}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#B0B7C3"
                      fontSize={9.5}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <ChartTooltip
                      contentStyle={{
                        backgroundColor: '#16181D',
                        borderColor: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="Companies" radius={[6, 6, 0, 0]}>
                      {barData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Industry Sectors Donut Chart */}
            <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4 shadow-md">
              <div>
                <h3 className="text-[14px] font-extrabold text-white flex items-center gap-2">
                  <PieChartIcon className="w-4.5 h-4.5 text-accent" />
                  <span>Sector Allocation Coverage</span>
                </h3>
                <p className="text-[10.5px] text-text-secondary mt-0.5">Distribution of startups by Linkedin categories</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mt-2 grow">
                {/* Chart */}
                <div className="w-full h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: '#16181D',
                          borderColor: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: '8px',
                          fontSize: '11px',
                        }}
                      />
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend list */}
                <div className="flex flex-col gap-2.5 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-[11.5px] font-medium leading-none">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-text-secondary text-[11px] leading-tight line-clamp-2" title={item.name}>{item.name}</span>
                      </div>
                      <span className="text-white font-mono shrink-0">{item.value} co</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* --- BOTTOM ROW: CAPITAL EFFICIENCY CORRELATION SCATTER CHART --- */}
          <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4 shadow-md">
            <div>
              <h3 className="text-[14px] font-extrabold text-white flex items-center gap-2">
                <Compass className="w-4.5 h-4.5 text-accent" />
                <span>Capital Efficiency Matrix</span>
              </h3>
              <p className="text-[10.5px] text-text-secondary mt-0.5">
                Correlation plot of Total Funding USD (Y-axis) vs Headcount Scale (X-axis). Startups at the bottom-right are highly capital-efficient!
              </p>
            </div>

            <div className="w-full h-[320px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 0, left: -25 }}>
                  <XAxis
                    type="number"
                    dataKey="Headcount"
                    name="Employees"
                    stroke="#B0B7C3"
                    fontSize={9.5}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatCompactNumber(v)}
                  />
                  <YAxis
                    type="number"
                    dataKey="Funding"
                    name="Funding"
                    unit="M"
                    stroke="#B0B7C3"
                    fontSize={9.5}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${formatCompactNumber(v * 1_000_000)}`}
                  />
                  <ZAxis type="number" dataKey="Growth" range={[40, 300]} name="YoY Growth" unit="%" />
                  <ChartTooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{
                      backgroundColor: '#16181D',
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Scatter name="Capital Burn Efficiency" data={scatterData} fill="#7C5CFC" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export default Analytics;
