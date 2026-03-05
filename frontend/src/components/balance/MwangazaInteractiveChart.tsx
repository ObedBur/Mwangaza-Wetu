"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface DailyData {
    date: string;
    epargne: number;
    retrait: number;
    credit: number;
    remboursement: number;
}

const chartConfig = {
    epargne: {
        label: "Épargne",
        color: "hsl(var(--chart-1))",
    },
    retrait: {
        label: "Retrait",
        color: "hsl(var(--chart-2))",
    },
    credit: {
        label: "Crédit",
        color: "hsl(var(--chart-3))",
    },
    remboursement: {
        label: "Remboursement",
        color: "hsl(var(--chart-4))",
    },
} satisfies ChartConfig

export function MwangazaInteractiveChart({ data }: { data: DailyData[] }) {
    const [timeRange, setTimeRange] = React.useState("90d")

    const filteredData = React.useMemo(() => {
        if (!data || data.length === 0) return [];

        const referenceDate = new Date();
        let daysToSubtract = 90;
        if (timeRange === "30d") daysToSubtract = 30;
        if (timeRange === "7d") daysToSubtract = 7;

        const startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - daysToSubtract);

        return data.filter((item) => {
            const date = new Date(item.date);
            return date >= startDate;
        });
    }, [data, timeRange]);

    return (
        <Card className="rounded-[2.5rem] border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b border-slate-100 dark:border-slate-800 py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle className="text-xl font-black uppercase tracking-tight">Flux Interactifs (Réels)</CardTitle>
                    <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Analyse comparative des opérations financières des 90 derniers jours
                    </CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger
                        className="w-[160px] rounded-xl sm:ml-auto font-bold text-xs uppercase h-10"
                        aria-label="Sélectionner la période"
                    >
                        <SelectValue placeholder="Derniers 3 mois" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-bold text-xs uppercase">
                        <SelectItem value="90d" className="rounded-lg">Derniers 3 mois</SelectItem>
                        <SelectItem value="30d" className="rounded-lg">Derniers 30 jours</SelectItem>
                        <SelectItem value="7d" className="rounded-lg">Derniers 7 jours</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <AreaChart data={filteredData}>
                        <defs>
                            <linearGradient id="fillEpargne" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-epargne)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-epargne)" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="fillRetrait" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-retrait)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-retrait)" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="fillCredit" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-credit)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-credit)" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="fillRemboursement" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-remboursement)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-remboursement)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeOpacity={0.1} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("fr-FR", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                            className="text-[10px] font-bold text-slate-400 uppercase"
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString("fr-FR", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }}
                                    indicator="dot"
                                />
                            }
                        />
                        <Area
                            dataKey="remboursement"
                            type="natural"
                            fill="url(#fillRemboursement)"
                            stroke="var(--color-remboursement)"
                            stackId="a"
                            strokeWidth={2}
                        />
                        <Area
                            dataKey="credit"
                            type="natural"
                            fill="url(#fillCredit)"
                            stroke="var(--color-credit)"
                            stackId="a"
                            strokeWidth={2}
                        />
                        <Area
                            dataKey="retrait"
                            type="natural"
                            fill="url(#fillRetrait)"
                            stroke="var(--color-retrait)"
                            stackId="a"
                            strokeWidth={2}
                        />
                        <Area
                            dataKey="epargne"
                            type="natural"
                            fill="url(#fillEpargne)"
                            stroke="var(--color-epargne)"
                            stackId="a"
                            strokeWidth={2}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
