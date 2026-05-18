import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { getTheme } from "@/lib/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type Props = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  icon?: keyof typeof Ionicons.glyphMap;
};

function hhmmToDate(value: string): Date {
  const [h, m] = value.split(":").map((p) => parseInt(p, 10));
  const d = new Date();
  d.setHours(Number.isFinite(h) ? h : 8, Number.isFinite(m) ? m : 0, 0, 0);
  return d;
}

function dateToHHMM(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function TimeField({ label, value, onChange, icon = "time-outline" }: Props) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const [open, setOpen] = useState(false);

  const handleAndroidChange = (event: DateTimePickerEvent, date?: Date) => {
    setOpen(false);
    if (event.type === "set" && date) {
      onChange(dateToHHMM(date));
    }
  };

  const handleIOSChange = (_: DateTimePickerEvent, date?: Date) => {
    if (date) onChange(dateToHHMM(date));
  };

  return (
    <View style={styles.row}>
      <View style={styles.labelRow}>
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
        <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      </View>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.value,
          {
            backgroundColor: theme.colors.surfaceAlt,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text style={[styles.valueText, { color: theme.colors.text }]}>{value}</Text>
      </Pressable>

      {Platform.OS === "android" && open ? (
        <DateTimePicker
          mode="time"
          value={hhmmToDate(value)}
          is24Hour
          onChange={handleAndroidChange}
        />
      ) : null}

      {Platform.OS === "ios" ? (
        <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
          <View
            style={[
              styles.iosSheet,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <DateTimePicker
              mode="time"
              value={hhmmToDate(value)}
              display="spinner"
              onChange={handleIOSChange}
              themeVariant={scheme === "dark" ? "dark" : "light"}
            />
            <Pressable
              onPress={() => setOpen(false)}
              style={[styles.iosDone, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={styles.iosDoneText}>Confirmar</Text>
            </Pressable>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
  },
  value: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 84,
    alignItems: "center",
  },
  valueText: {
    fontSize: 16,
    fontWeight: "700",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  iosSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 36,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  iosDone: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  iosDoneText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
