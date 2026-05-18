import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { getTheme } from "@/lib/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type Preset = { amount: number; label: string; icon: keyof typeof Ionicons.glyphMap };

const DEFAULTS: Preset[] = [
  { amount: 200, label: "200 ml", icon: "cafe-outline" },
  { amount: 300, label: "300 ml", icon: "water-outline" },
  { amount: 500, label: "500 ml", icon: "wine-outline" },
];

type Props = {
  onAdd: (amount: number) => void;
  onCustom: () => void;
  presets?: Preset[];
};

export function QuickAddRow({ onAdd, onCustom, presets = DEFAULTS }: Props) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);

  const handlePress = async (amount: number) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // haptics not available
    }
    onAdd(amount);
  };

  return (
    <View style={styles.row}>
      {presets.map((p) => (
        <Pressable
          key={p.amount}
          onPress={() => handlePress(p.amount)}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          <Ionicons name={p.icon} size={26} color={theme.colors.primary} />
          <Text style={[styles.label, { color: theme.colors.text }]}>{p.label}</Text>
        </Pressable>
      ))}
      <Pressable
        onPress={onCustom}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
        ]}
      >
        <Ionicons name="add" size={26} color="#FFFFFF" />
        <Text style={[styles.label, { color: "#FFFFFF" }]}>Outro</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
});
