import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { getTheme } from "@/lib/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type Props = {
  visible: boolean;
  initialAmount?: number;
  title?: string;
  onCancel: () => void;
  onConfirm: (amountMl: number) => void;
};

export function AmountModal({
  visible,
  initialAmount = 250,
  title = "Quanto você bebeu?",
  onCancel,
  onConfirm,
}: Props) {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);
  const [text, setText] = useState(String(initialAmount));

  useEffect(() => {
    if (visible) setText(String(initialAmount));
  }, [visible, initialAmount]);

  const parsed = parseInt(text.replace(/[^0-9]/g, ""), 10);
  const valid = Number.isFinite(parsed) && parsed > 0 && parsed <= 5000;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.backdrop}
      >
        <Pressable style={styles.dismissArea} onPress={onCancel} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
            <Pressable onPress={onCancel} hitSlop={10}>
              <Ionicons name="close" size={22} color={theme.colors.textMuted} />
            </Pressable>
          </View>
          <View
            style={[
              styles.inputRow,
              {
                backgroundColor: theme.colors.surfaceAlt,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <TextInput
              value={text}
              onChangeText={setText}
              keyboardType="number-pad"
              style={[styles.input, { color: theme.colors.text }]}
              maxLength={4}
              placeholder="250"
              placeholderTextColor={theme.colors.textMuted}
              autoFocus
            />
            <Text style={[styles.unit, { color: theme.colors.textMuted }]}>ml</Text>
          </View>
          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              style={[styles.btn, { backgroundColor: theme.colors.surfaceAlt }]}
            >
              <Text style={[styles.btnText, { color: theme.colors.text }]}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={() => valid && onConfirm(parsed)}
              disabled={!valid}
              style={[
                styles.btn,
                {
                  backgroundColor: valid ? theme.colors.primary : theme.colors.ringTrack,
                  opacity: valid ? 1 : 0.6,
                },
              ]}
            >
              <Text style={[styles.btnText, { color: "#FFFFFF" }]}>Adicionar</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    gap: 18,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 32,
    fontWeight: "700",
    paddingVertical: 18,
  },
  unit: {
    fontSize: 18,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  btnText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
