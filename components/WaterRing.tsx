import { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

import { formatMl } from "@/lib/goal";
import { getTheme } from "@/lib/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  totalMl: number;
  goalMl: number;
  size?: number;
  strokeWidth?: number;
};

export function WaterRing({ totalMl, goalMl, size = 260, strokeWidth = 22 }: Props) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);
  const target = useMemo(() => {
    if (goalMl <= 0) return 0;
    return Math.min(1, totalMl / goalMl);
  }, [totalMl, goalMl]);

  useEffect(() => {
    progress.value = withTiming(target, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [target, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const percent = Math.round(target * 100);
  const remaining = Math.max(0, goalMl - totalMl);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={theme.colors.accent} />
            <Stop offset="1" stopColor={theme.colors.primary} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.ringTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={[styles.percent, { color: theme.colors.primaryDark }]}>{percent}%</Text>
        <Text style={[styles.totals, { color: theme.colors.text }]}>
          {formatMl(totalMl)}
          <Text style={{ color: theme.colors.textMuted }}> / {formatMl(goalMl)}</Text>
        </Text>
        <Text style={[styles.remaining, { color: theme.colors.textMuted }]}>
          {remaining > 0 ? `Faltam ${formatMl(remaining)}` : "Meta atingida!"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  percent: {
    fontSize: 56,
    fontWeight: "700",
    letterSpacing: -1,
  },
  totals: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 4,
  },
  remaining: {
    fontSize: 14,
    marginTop: 6,
  },
});
