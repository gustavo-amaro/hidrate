# Hidrate — Lembrete de beber água

App Expo + React Native (TypeScript) que ajuda você a manter sua hidratação em dia. Calcula uma meta diária a partir do seu peso e altura, distribui lembretes ao longo do dia (entre o horário de acordar e dormir) e registra seu progresso, com histórico semanal e streak de dias na meta.

Tudo funciona **offline**: nada de contas, login ou backend. Seus dados ficam no celular via `AsyncStorage`.

## Recursos

- Onboarding em 3 passos (peso/altura, rotina, meta).
- Cálculo da meta diária pela área de superfície corporal (Mosteller) ajustada por nível de atividade.
- Possibilidade de definir meta manualmente.
- Lembretes locais distribuídos uniformemente entre os horários de acordar e dormir.
- Home com anel de progresso animado e botões rápidos para registrar 200 / 300 / 500 ml (ou valor customizado).
- Histórico dos últimos 7 dias com gráfico de barras, média semanal, melhor dia, dias na meta e streak.
- Dark mode automático.

## Stack

- Expo SDK 54 (com nova arquitetura habilitada)
- expo-router (roteamento por arquivos)
- expo-notifications, expo-haptics, expo-linear-gradient
- @react-native-async-storage/async-storage
- react-native-reanimated, react-native-svg
- @react-native-community/datetimepicker
- date-fns

## Como rodar

Requer Node.js 18+ e o app **Expo Go** ou um build de desenvolvimento.

```bash
npm install
npx expo start
```

Em seguida, escaneie o QR code com o app Expo Go (Android/iOS) ou pressione `a` / `i` para abrir em um emulador.

> Importante: notificações agendadas locais funcionam em dispositivos físicos. Algumas restrições do Expo Go podem aparecer dependendo da plataforma — se precisar testar lembretes com fidelidade, gere um build de desenvolvimento com `npx expo run:android` / `npx expo run:ios` ou use o EAS Build.

## Estrutura

```
app/
  _layout.tsx            # Root: providers + gate de onboarding
  onboarding.tsx         # Wizard de 3 passos
  (tabs)/
    _layout.tsx          # Barra de abas (Hoje, Histórico, Ajustes)
    index.tsx            # Tela Hoje
    history.tsx          # Tela Histórico
    settings.tsx         # Tela Ajustes
components/              # WaterRing, QuickAddRow, WeeklyChart, StreakBadge, StatCard...
lib/
  AppContext.tsx         # Estado global (perfil + log do dia)
  storage.ts             # Wrapper de AsyncStorage
  goal.ts                # Cálculo de meta (BSA Mosteller × fator de atividade)
  notifications.ts       # Permissões + agendamento dos lembretes
  streak.ts              # Streak e resumos
  theme.ts               # Paleta light/dark
types/index.ts           # Tipos compartilhados
```

## Fórmula da meta

```
BSA = sqrt(peso_kg × altura_cm / 3600)       # Mosteller
fator = sedentário 1.0 | moderado 1.15 | ativo 1.3
meta_ml = round(BSA × 1500 × fator / 50) × 50
```

Para um adulto de 70 kg e 170 cm com atividade moderada, isso resulta em aproximadamente **3,1 L/dia**. A meta sempre pode ser sobrescrita manualmente nos ajustes.
