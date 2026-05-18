import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Line, Rect, Stop } from "react-native-svg";

import { formatDayLabel } from "@/lib/streak";
import { getTheme } from "@/lib/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { DailyLog } from "@/types";

type Props = {
  logs: DailyLog[];
  goalMl: number;
  height?: number;
};

export function WeeklyChart({ logs, goalMl, height = 180 }: Props) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);

  const { maxVal, bars } = useMemo(() => {
    const peak = Math.max(goalMl, ...logs.map((l) => l.totalMl), 1);
    return {
      maxVal: peak,
      bars: logs.map((log) => ({
        date: log.date,
        value: log.totalMl,
        ratio: peak > 0 ? log.totalMl / peak : 0,
        hit: goalMl > 0 && log.totalMl >= goalMl,
      })),
    };
  }, [logs, goalMl]);

  const chartHeight = height - 28;
  const barCount = bars.length || 1;
  const slotWidth = 100 / barCount;
  const barWidth = slotWidth * 0.55;
  const barInset = (slotWidth - barWidth) / 2;
  const goalY = chartHeight * (1 - (goalMl > 0 ? Math.min(1, goalMl / maxVal) : 1));

  return (
    <View>
      <View style={{ height }}>
        <Svg width="100%" height={chartHeight}>
          <Defs>
            <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={theme.colors.accent} />
              <Stop offset="1" stopColor={theme.colors.primary} />
            </LinearGradient>
          </Defs>
          <Line
            x1="0"
            y1={goalY}
            x2="100%"
            y2={goalY}
            stroke={theme.colors.textMuted}
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
          {bars.map((bar, idx) => {
            const h = Math.max(4, bar.ratio * chartHeight);
            const x = `${idx * slotWidth + barInset}%`;
            const y = chartHeight - h;
            return (
              <Rect
                key={bar.date}
                x={x}
                y={y}
                width={`${barWidth}%`}
                height={h}
                rx={6}
                fill={bar.hit ? "url(#barGrad)" : theme.colors.ringTrack}
              />
            );
          })}
        </Svg>
        <View style={styles.labels}>
          {bars.map((bar) => (
            <View key={bar.date} style={[styles.labelCell, { width: `${slotWidth}%` }]}>
              <Text style={[styles.labelText, { color: theme.colors.textMuted }]}>
                {formatDayLabel(bar.date)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: {
    flexDirection: "row",
    height: 24,
    marginTop: 4,
  },
  labelCell: {
    alignItems: "center",
    justifyContent: "center",
  },
  labelText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
