"use client";

import { useState, useEffect, useCallback } from "react";
import { TooltipProps } from "recharts";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartPoint, Period } from "@/types";
import { formatPrice } from "@/lib/utils";
import * as api from "@/lib/api";

const PERIODS: Period[] = ["1D", "1W", "1M", "3M", "6M", "1Y", "5Y"];

const PERIOD_LABELS: Record<Period, string> = {
  "1D": "1J",
  "1W": "1S",
  "1M": "1M",
  "3M": "3M",
  "6M": "6M",
  "1Y": "1A",
  "5Y": "5A",
};

type RechartsTooltipProps = TooltipProps<number, string>;

function CustomTooltip(props: RechartsTooltipProps & { currency: string }) {
  const { active, payload, label, currency } = props;
  if (!active || !payload || payload.length === 0) return null;
  const first = payload[0] as { value?: number } | undefined;
  const val = first?.value ?? 0;
  return (
    <div className="bg-bg-hover border border-bg-border rounded-lg px-3 py-2 shadow-xl">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="text-sm font-semibold text-white">
        {formatPrice(val, currency)}
      </div>
    </div>
  );
}

interface StockChartProps {
  symbol: string;
  currency?: string;
  isPositive?: boolean;
  initialPeriod?: Period;
}

export default function StockChart({
  symbol,
  currency = "USD",
  isPositive = true,
  initialPeriod = "1M",
}: StockChartProps) {
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const color = isPositive ? "#00d4a3" : "#ff4c6a";

  // Calculate date range based on period
  const getDateRange = (period: Period): { period1: string; period2: string } => {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case "1D":
        startDate.setDate(endDate.getDate() - 1);
        break;
      case "1W":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "1M":
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case "3M":
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case "6M":
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case "1Y":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case "5Y":
        startDate.setFullYear(endDate.getFullYear() - 5);
        break;
    }

    return {
      period1: startDate.toISOString(),
      period2: endDate.toISOString(),
    };
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { period1, period2 } = getDateRange(period);
      const d = await api.fetchHistory(symbol, period1, period2);
      
      // Transform the data to ensure we have the 'time' field
      // Backend may return 'date' instead of 'time'
      const transformedData = Array.isArray(d)
        ? d.map((item: unknown) => {
            const rec = item as Record<string, unknown>;
            const dateValue = (rec.time ?? rec.date) as string | undefined;
            const dateObj = new Date(dateValue ?? Date.now());
            
            // Format based on period
            let formattedTime: string;
            if (period === "1D") {
              formattedTime = dateObj.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              });
            } else if (period === "1W" || period === "1M") {
              formattedTime = dateObj.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
            } else {
              formattedTime = dateObj.toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              });
            }
            
            const priceVal = (() => {
              const p = rec.price ?? rec.close;
              if (typeof p === "number") return p;
              if (typeof p === "string") return Number(p) || 0;
              return 0;
            })();

            return {
              time: formattedTime,
              price: priceVal,
              open: typeof rec.open === "number" ? rec.open : undefined,
              high: typeof rec.high === "number" ? rec.high : undefined,
              low: typeof rec.low === "number" ? rec.low : undefined,
              volume: typeof rec.volume === "number" ? rec.volume : undefined,
            } as ChartPoint;
          })
        : [];
      
      setData(transformedData);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [symbol, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const minVal = data.length ? Math.min(...data.map((d) => d.price)) * 0.999 : 0;
  const maxVal = data.length ? Math.max(...data.map((d) => d.price)) * 1.001 : 100;

  return (
    <div className="bg-bg-card border border-bg-border rounded-xl p-5">
      {/* Period selector */}
      <div className="flex items-center gap-1 mb-5">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              period === p
                ? "bg-accent-blue text-white shadow-lg shadow-accent-blue/20"
                : "text-slate-400 hover:text-white hover:bg-bg-hover"
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
            <span className="text-slate-500 text-sm">Chargement…</span>
          </div>
        </div>
      ) : error ? (
        <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
          Impossible de charger les données
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
          Aucune donnée disponible
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
          >
            <defs>
              <linearGradient id={`grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e2d40"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="#374151"
              tick={{ fill: "#4b5563", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#374151"
              tick={{ fill: "#4b5563", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              domain={[minVal, maxVal]}
              width={60}
              tickFormatter={(v) =>
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency,
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(v)
              }
            />
            <Tooltip
              content={(props) => (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <CustomTooltip {...(props as any)} currency={currency} />
              )}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={color}
              fill={`url(#grad-${symbol})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color, stroke: "#080b11", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
