import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { getTheme } from "@/lib/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  hint?: string;
  tint?: string;
};

export function StatCard({ icon, label, value, hint, tint }: Props) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const color = tint ?? theme.colors.primary;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      <View style={[styles.iconBubble, { backgroundColor: theme.colors.surfaceAlt }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.colors.text }]}>{value}</Text>
      {hint ? <Text style={[styles.hint, { color: theme.colors.textMuted }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
  },
  hint: {
    fontSize: 11,
  },
});
