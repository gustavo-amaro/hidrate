import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { getTheme } from "@/lib/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type Props = {
  streak: number;
};

export function StreakBadge({ streak }: Props) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      <Ionicons name="flame" size={20} color={streak > 0 ? "#FF8A3D" : theme.colors.textMuted} />
      <View style={{ marginLeft: 8 }}>
        <Text style={[styles.value, { color: theme.colors.text }]}>{streak}</Text>
        <Text style={[styles.label, { color: theme.colors.textMuted }]}>
          {streak === 1 ? "dia" : "dias"} de sequência
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 22,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
  },
});
