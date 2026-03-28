import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BasicCalculatorScreen } from '@/screens/BasicCalculatorScreen';
import { ScientificCalculatorScreen } from '@/screens/ScientificCalculatorScreen';
import { GraphingCalculatorScreen } from '@/screens/GraphingCalculatorScreen';
import { FinancialCalculatorScreen } from '@/screens/FinancialCalculatorScreen';
import { ProgrammerCalculatorScreen } from '@/screens/ProgrammerCalculatorScreen';
import { StatisticsCalculatorScreen } from '@/screens/StatisticsCalculatorScreen';
import { MatrixCalculatorScreen } from '@/screens/MatrixCalculatorScreen';
import { EquationSolverScreen } from '@/screens/EquationSolverScreen';
import { DateTimeCalculatorScreen } from '@/screens/DateTimeCalculatorScreen';
import { HealthCalculatorScreen } from '@/screens/HealthCalculatorScreen';

export type CalcStackParamList = {
  CalcMenu: undefined;
  Basic: undefined;
  Scientific: undefined;
  Graphing: undefined;
  Financial: undefined;
  Programmer: undefined;
  Statistics: undefined;
  Matrix: undefined;
  Equation: undefined;
  DateTime: undefined;
  Health: undefined;
};

const Stack = createNativeStackNavigator<CalcStackParamList>();

const CALC_MODULES = [
  { key: 'Basic', name: 'Basic', icon: '🔢', description: 'Arithmetic & memory' },
  { key: 'Scientific', name: 'Scientific', icon: '🔬', description: 'Trig, logs, advanced math' },
  { key: 'Graphing', name: 'Graphing', icon: '📈', description: 'Plot functions visually' },
  { key: 'Financial', name: 'Financial', icon: '💰', description: 'Loans, investments, taxes' },
  { key: 'Programmer', name: 'Programmer', icon: '💻', description: 'Hex, binary, bitwise ops' },
  { key: 'Statistics', name: 'Statistics', icon: '📊', description: 'Data analysis & regression' },
  { key: 'Matrix', name: 'Matrix', icon: '🔲', description: 'Matrix algebra & equations' },
  { key: 'Equation', name: 'Equation Solver', icon: '🔀', description: 'Linear, quadratic, systems' },
  { key: 'DateTime', name: 'Date & Time', icon: '📅', description: 'Date diff, timezones, age' },
  { key: 'Health', name: 'Health', icon: '❤️', description: 'BMI, BMR, fitness tools' },
] as const;

function CalcMenuScreen({ navigation }: { navigation: { navigate: (name: string) => void } }) {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bgBase }]}>
      <Text style={[styles.header, { color: colors.textPrimary }]}>CalcPro</Text>
      <Text style={[styles.subheader, { color: colors.textSecondary }]}>Enterprise Calculator Suite</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {CALC_MODULES.map((m) => (
          <Pressable
            key={m.key}
            onPress={() => navigation.navigate(m.key)}
            accessibilityRole="button"
            accessibilityLabel={`${m.name}: ${m.description}`}
            style={[styles.card, { backgroundColor: colors.bgSurface, borderColor: colors.border, minHeight: 64 }]}
          >
            <Text style={styles.cardIcon}>{m.icon}</Text>
            <View style={styles.cardText}>
              <Text style={[styles.cardName, { color: colors.textPrimary }]}>{m.name}</Text>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{m.description}</Text>
            </View>
            <Text style={[styles.chevron, { color: colors.textDisabled }]}>›</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export function CalcStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalcMenu" component={CalcMenuScreen} />
      <Stack.Screen name="Basic" component={BasicCalculatorScreen} />
      <Stack.Screen name="Scientific" component={ScientificCalculatorScreen} />
      <Stack.Screen name="Graphing" component={GraphingCalculatorScreen} />
      <Stack.Screen name="Financial" component={FinancialCalculatorScreen} />
      <Stack.Screen name="Programmer" component={ProgrammerCalculatorScreen} />
      <Stack.Screen name="Statistics" component={StatisticsCalculatorScreen} />
      <Stack.Screen name="Matrix" component={MatrixCalculatorScreen} />
      <Stack.Screen name="Equation" component={EquationSolverScreen} />
      <Stack.Screen name="DateTime" component={DateTimeCalculatorScreen} />
      <Stack.Screen name="Health" component={HealthCalculatorScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { fontSize: 34, fontWeight: '700', marginTop: 20, marginHorizontal: 20 },
  subheader: { fontSize: 15, marginHorizontal: 20, marginBottom: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 120 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
    gap: 14,
  },
  cardIcon: { fontSize: 28 },
  cardText: { flex: 1 },
  cardName: { fontSize: 17, fontWeight: '600', marginBottom: 2 },
  cardDesc: { fontSize: 13 },
  chevron: { fontSize: 24, fontWeight: '300' },
});
