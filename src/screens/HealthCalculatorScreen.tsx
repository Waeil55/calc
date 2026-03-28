import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type HealthTool =
  | 'bmi'
  | 'bmr'
  | 'calorie'
  | 'bodyfat'
  | 'idealweight'
  | 'hydration'
  | 'onerm'
  | 'pregnancy'
  | 'bloodpressure';

const TOOLS: { id: HealthTool; label: string }[] = [
  { id: 'bmi', label: 'BMI' },
  { id: 'bmr', label: 'BMR' },
  { id: 'calorie', label: 'Calories' },
  { id: 'bodyfat', label: 'Body Fat' },
  { id: 'idealweight', label: 'Ideal Weight' },
  { id: 'hydration', label: 'Hydration' },
  { id: 'onerm', label: '1RM' },
  { id: 'pregnancy', label: 'Pregnancy' },
  { id: 'bloodpressure', label: 'Blood Pressure' },
];

// ──────────────────────────────────────────────────────────────
//  Shared small components
// ──────────────────────────────────────────────────────────────
function Field({ label, value, onChange, colors }: { label: string; value: string; onChange: (v: string) => void; colors: Record<string, string> }) {
  return (
    <View style={fStyles.container}>
      <Text style={[fStyles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={colors.textDisabled} style={[fStyles.input, { color: colors.textPrimary, borderColor: colors.border }]} accessibilityLabel={label} />
    </View>
  );
}
const fStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  label: { fontSize: 14, flex: 1 },
  input: { borderWidth: 1, borderRadius: 10, padding: 8, width: 120, fontSize: 16, textAlign: 'right' },
});

function SexToggle({ sex, onChange, colors }: { sex: 'male' | 'female'; onChange: (v: 'male' | 'female') => void; colors: Record<string, string> }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
      {(['male', 'female'] as const).map((s) => (
        <Pressable key={s} onPress={() => onChange(s)} style={[sexStyles.btn, { backgroundColor: sex === s ? colors.accentPrimary : colors.bgSurface }]} accessibilityRole="button" accessibilityLabel={s} accessibilityState={{ selected: sex === s }}>
          <Text style={[sexStyles.label, { color: sex === s ? '#FFF' : colors.textSecondary }]}>{s === 'male' ? '♂ Male' : '♀ Female'}</Text>
        </Pressable>
      ))}
    </View>
  );
}
const sexStyles = StyleSheet.create({
  btn: { flex: 1, borderRadius: 14, paddingVertical: 10, alignItems: 'center' },
  label: { fontSize: 14, fontWeight: '600' },
});

function CalcBtn({ onPress, colors }: { onPress: () => void; colors: Record<string, string> }) {
  return (
    <Pressable onPress={onPress} style={[cbStyles.btn, { backgroundColor: colors.accentPrimary }]} accessibilityRole="button" accessibilityLabel="Calculate">
      <Text style={cbStyles.label}>Calculate</Text>
    </Pressable>
  );
}
const cbStyles = StyleSheet.create({
  btn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  label: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

function ResCard({ children, colors }: { children: React.ReactNode; colors: Record<string, string> }) {
  return <View style={[rcStyles.card, { backgroundColor: colors.bgSurface }]}>{children}</View>;
}
const rcStyles = StyleSheet.create({ card: { borderRadius: 16, padding: 16, gap: 8, marginTop: 12 } });

function ResLine({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={rlStyles.row}>
      <Text style={[rlStyles.label, { color: '#888' }]}>{label}</Text>
      <Text style={[rlStyles.value, { color }]}>{value}</Text>
    </View>
  );
}
const rlStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 13 },
  value: { fontSize: 15, fontWeight: '700' },
});

// ──────────────────────────────────────────────────────────────
//  BMI
// ──────────────────────────────────────────────────────────────
function BMITool({ colors }: { colors: Record<string, string> }) {
  const [weight, setWeight] = useState(''); // kg
  const [height, setHeight] = useState(''); // cm
  const [result, setResult] = useState<null | { bmi: number; category: string; color: string }>(null);
  const calculate = () => {
    const w = parseFloat(weight), h = parseFloat(height) / 100;
    if (!w || !h) return;
    const bmi = w / (h * h);
    let category = '', color = '#FFF';
    if (bmi < 18.5) { category = 'Underweight'; color = '#00D4FF'; }
    else if (bmi < 25) { category = 'Normal weight'; color = '#00E5A0'; }
    else if (bmi < 30) { category = 'Overweight'; color = '#FFB547'; }
    else { category = 'Obese'; color = '#FF5A5A'; }
    setResult({ bmi, category, color });
  };
  return (
    <View style={styles.section}>
      <Field label="Weight (kg)" value={weight} onChange={setWeight} colors={colors} />
      <Field label="Height (cm)" value={height} onChange={setHeight} colors={colors} />
      <CalcBtn onPress={calculate} colors={colors} />
      {result && (
        <ResCard colors={colors}>
          <Text style={[{ fontSize: 48, fontWeight: '700', color: result.color, textAlign: 'center' }]}>{result.bmi.toFixed(1)}</Text>
          <Text style={[{ fontSize: 18, fontWeight: '600', color: result.color, textAlign: 'center' }]}>{result.category}</Text>
          <View style={styles.bmiBar}>
            {[{ w: 18.5, c: '#00D4FF' }, { w: 25, c: '#00E5A0' }, { w: 30, c: '#FFB547' }, { w: 40, c: '#FF5A5A' }].map((seg, i) => (
              <View key={i} style={[styles.bmiSeg, { backgroundColor: seg.c, flex: 1 }]} />
            ))}
          </View>
        </ResCard>
      )}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────
//  BMR (Mifflin-St Jeor)
// ──────────────────────────────────────────────────────────────
function BMRTool({ colors }: { colors: Record<string, string> }) {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [result, setResult] = useState<null | { bmr: number; sedentary: number; light: number; moderate: number; active: number; veryActive: number }>(null);
  const calculate = () => {
    const w = parseFloat(weight), h = parseFloat(height), a = parseFloat(age);
    if (!w || !h || !a) return;
    const bmr = sex === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    setResult({ bmr, sedentary: bmr * 1.2, light: bmr * 1.375, moderate: bmr * 1.55, active: bmr * 1.725, veryActive: bmr * 1.9 });
  };
  return (
    <View style={styles.section}>
      <SexToggle sex={sex} onChange={setSex} colors={colors} />
      <Field label="Weight (kg)" value={weight} onChange={setWeight} colors={colors} />
      <Field label="Height (cm)" value={height} onChange={setHeight} colors={colors} />
      <Field label="Age (years)" value={age} onChange={setAge} colors={colors} />
      <CalcBtn onPress={calculate} colors={colors} />
      {result && (
        <ResCard colors={colors}>
          <ResLine label="BMR" value={`${result.bmr.toFixed(0)} kcal`} color={colors.accentPrimary} />
          <ResLine label="Sedentary (×1.2)" value={`${result.sedentary.toFixed(0)} kcal`} color={colors.textPrimary} />
          <ResLine label="Light (×1.375)" value={`${result.light.toFixed(0)} kcal`} color={colors.textPrimary} />
          <ResLine label="Moderate (×1.55)" value={`${result.moderate.toFixed(0)} kcal`} color={colors.textPrimary} />
          <ResLine label="Active (×1.725)" value={`${result.active.toFixed(0)} kcal`} color={colors.textPrimary} />
          <ResLine label="Very Active (×1.9)" value={`${result.veryActive.toFixed(0)} kcal`} color={colors.textPrimary} />
        </ResCard>
      )}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────
//  Calorie Deficit/Surplus
// ──────────────────────────────────────────────────────────────
function CalorieTool({ colors }: { colors: Record<string, string> }) {
  const [tdee, setTdee] = useState('');
  const [goal, setGoal] = useState<'lose' | 'gain' | 'maintain'>('lose');
  const [rate, setRate] = useState('0.5'); // kg/week
  const [result, setResult] = useState<null | { target: number; weeksTo5kg: number }>(null);
  const calculate = () => {
    const t = parseFloat(tdee), r = parseFloat(rate);
    if (!t || !r) return;
    const deficit = goal === 'maintain' ? 0 : goal === 'lose' ? -r * 7700 / 7 : r * 7700 / 7;
    setResult({ target: t + deficit, weeksTo5kg: 5 / r });
  };
  return (
    <View style={styles.section}>
      <Field label="TDEE (kcal/day)" value={tdee} onChange={setTdee} colors={colors} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['lose', 'maintain', 'gain'] as const).map((g) => (
          <Pressable key={g} onPress={() => setGoal(g)} style={[styles.chip, { backgroundColor: goal === g ? colors.accentPrimary : colors.bgSurface }]} accessibilityRole="button" accessibilityLabel={g} accessibilityState={{ selected: goal === g }}>
            <Text style={[styles.chipLabel, { color: goal === g ? '#FFF' : colors.textSecondary }]}>{g.charAt(0).toUpperCase() + g.slice(1)}</Text>
          </Pressable>
        ))}
      </View>
      {goal !== 'maintain' && <Field label="Rate (kg/week)" value={rate} onChange={setRate} colors={colors} />}
      <CalcBtn onPress={calculate} colors={colors} />
      {result && (
        <ResCard colors={colors}>
          <ResLine label="Daily target" value={`${result.target.toFixed(0)} kcal`} color={colors.accentPrimary} />
          {goal !== 'maintain' && <ResLine label="Weeks to reach 5kg goal" value={`${result.weeksTo5kg.toFixed(1)} weeks`} color={colors.textPrimary} />}
        </ResCard>
      )}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────
//  Body Fat % (US Navy)
// ──────────────────────────────────────────────────────────────
function BodyFatTool({ colors }: { colors: Record<string, string> }) {
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [height, setHeight] = useState('');
  const [neck, setNeck] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [result, setResult] = useState<string>('');
  const calculate = () => {
    const h = parseFloat(height), n = parseFloat(neck), w = parseFloat(waist), hi = parseFloat(hip);
    if (!h || !n || !w) return;
    let bf: number;
    if (sex === 'male') {
      bf = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
    } else {
      if (!hi) return;
      bf = 495 / (1.29579 - 0.35004 * Math.log10(w + hi - n) + 0.22100 * Math.log10(h)) - 450;
    }
    setResult(`${Math.max(0, bf).toFixed(1)}%`);
  };
  return (
    <View style={styles.section}>
      <SexToggle sex={sex} onChange={setSex} colors={colors} />
      <Field label="Height (cm)" value={height} onChange={setHeight} colors={colors} />
      <Field label="Neck (cm)" value={neck} onChange={setNeck} colors={colors} />
      <Field label="Waist (cm)" value={waist} onChange={setWaist} colors={colors} />
      {sex === 'female' && <Field label="Hip (cm)" value={hip} onChange={setHip} colors={colors} />}
      <CalcBtn onPress={calculate} colors={colors} />
      {!!result && <ResCard colors={colors}><Text style={[{ fontSize: 40, fontWeight: '700', color: colors.accentPrimary, textAlign: 'center' }]}>{result}</Text><Text style={[{ color: colors.textSecondary, textAlign: 'center' }]}>Body Fat Percentage</Text></ResCard>}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────
//  Ideal Weight (5 formulas)
// ──────────────────────────────────────────────────────────────
function IdealWeightTool({ colors }: { colors: Record<string, string> }) {
  const [height, setHeight] = useState('');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [result, setResult] = useState<null | { robinson: number; miller: number; devine: number; hamwi: number }>(null);
  const calculate = () => {
    const h = parseFloat(height);
    if (!h) return;
    const inches = (h - 152.4) / 2.54;
    if (sex === 'male') {
      setResult({ robinson: 52 + 1.9 * inches, miller: 56.2 + 1.41 * inches, devine: 50 + 2.3 * inches, hamwi: 48 + 2.7 * inches });
    } else {
      setResult({ robinson: 49 + 1.7 * inches, miller: 53.1 + 1.36 * inches, devine: 45.5 + 2.3 * inches, hamwi: 45.5 + 2.2 * inches });
    }
  };
  return (
    <View style={styles.section}>
      <SexToggle sex={sex} onChange={setSex} colors={colors} />
      <Field label="Height (cm)" value={height} onChange={setHeight} colors={colors} />
      <CalcBtn onPress={calculate} colors={colors} />
      {result && (
        <ResCard colors={colors}>
          {Object.entries(result).map(([formula, val]) => (
            <ResLine key={formula} label={formula.charAt(0).toUpperCase() + formula.slice(1)} value={`${val.toFixed(1)} kg`} color={colors.textPrimary} />
          ))}
        </ResCard>
      )}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────
//  Hydration
// ──────────────────────────────────────────────────────────────
function HydrationTool({ colors }: { colors: Record<string, string> }) {
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [result, setResult] = useState('');
  const calculate = () => {
    const w = parseFloat(weight);
    if (!w) return;
    const multiplier = activity === 'low' ? 30 : activity === 'moderate' ? 35 : 40;
    const ml = w * multiplier;
    setResult(`${(ml / 1000).toFixed(2)} L / day  (${ml.toFixed(0)} mL)`);
  };
  return (
    <View style={styles.section}>
      <Field label="Weight (kg)" value={weight} onChange={setWeight} colors={colors} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['low', 'moderate', 'high'] as const).map((a) => (
          <Pressable key={a} onPress={() => setActivity(a)} style={[styles.chip, { flex: 1, backgroundColor: activity === a ? colors.accentPrimary : colors.bgSurface }]} accessibilityRole="button" accessibilityLabel={a} accessibilityState={{ selected: activity === a }}>
            <Text style={[styles.chipLabel, { color: activity === a ? '#FFF' : colors.textSecondary, textAlign: 'center' }]}>{a.charAt(0).toUpperCase() + a.slice(1)}</Text>
          </Pressable>
        ))}
      </View>
      <CalcBtn onPress={calculate} colors={colors} />
      {!!result && <ResCard colors={colors}><Text style={[{ fontSize: 24, fontWeight: '700', color: colors.accentPrimary }]}>{result}</Text></ResCard>}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────
//  1 Rep Max (Epley formula)
// ──────────────────────────────────────────────────────────────
function OneRMTool({ colors }: { colors: Record<string, string> }) {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [result, setResult] = useState<null | { epley: number; brzycki: number; lander: number }>(null);
  const calculate = () => {
    const w = parseFloat(weight), r = parseInt(reps);
    if (!w || !r || r < 1) return;
    setResult({
      epley: w * (1 + r / 30),
      brzycki: w * (36 / (37 - r)),
      lander: (100 * w) / (101.3 - 2.67123 * r),
    });
  };
  return (
    <View style={styles.section}>
      <Field label="Weight lifted (kg)" value={weight} onChange={setWeight} colors={colors} />
      <Field label="Reps performed" value={reps} onChange={setReps} colors={colors} />
      <CalcBtn onPress={calculate} colors={colors} />
      {result && (
        <ResCard colors={colors}>
          <ResLine label="Epley" value={`${result.epley.toFixed(1)} kg`} color={colors.accentPrimary} />
          <ResLine label="Brzycki" value={`${result.brzycki.toFixed(1)} kg`} color={colors.textPrimary} />
          <ResLine label="Lander" value={`${result.lander.toFixed(1)} kg`} color={colors.textPrimary} />
        </ResCard>
      )}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────
//  Pregnancy (EDD)
// ──────────────────────────────────────────────────────────────
function PregnancyTool({ colors }: { colors: Record<string, string> }) {
  const [lmp, setLmp] = useState('');
  const [result, setResult] = useState('');
  const calculate = () => {
    const d = new Date(lmp);
    if (isNaN(d.getTime())) return;
    const edd = new Date(d);
    edd.setDate(edd.getDate() + 280);
    const now = new Date();
    const weeksPreg = Math.floor((now.getTime() - d.getTime()) / (7 * 86400000));
    const daysToEDD = Math.max(0, Math.floor((edd.getTime() - now.getTime()) / 86400000));
    setResult(`EDD: ${edd.toDateString()}\nCurrently: ${weeksPreg} weeks pregnant\nDays until EDD: ${daysToEDD}`);
  };
  return (
    <View style={styles.section}>
      <View style={[fStyles.container]}>
        <Text style={[fStyles.label, { color: colors.textSecondary }]}>Last Menstrual Period</Text>
        <TextInput value={lmp} onChangeText={setLmp} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textDisabled} style={[fStyles.input, { color: colors.textPrimary, borderColor: colors.border }]} accessibilityLabel="Last menstrual period date" />
      </View>
      <CalcBtn onPress={calculate} colors={colors} />
      {!!result && <ResCard colors={colors}><Text style={[{ fontSize: 16, color: colors.accentPrimary, lineHeight: 26 }]}>{result}</Text></ResCard>}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────
//  Blood Pressure
// ──────────────────────────────────────────────────────────────
function BloodPressureTool({ colors }: { colors: Record<string, string> }) {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [result, setResult] = useState<null | { category: string; color: string }>( null);
  const calculate = () => {
    const s = parseInt(systolic), d = parseInt(diastolic);
    if (isNaN(s) || isNaN(d)) return;
    let category = '', color = '';
    if (s < 120 && d < 80) { category = 'Normal'; color = '#00E5A0'; }
    else if (s < 130 && d < 80) { category = 'Elevated'; color = '#FFB547'; }
    else if (s < 140 || d < 90) { category = 'High Blood Pressure Stage 1'; color = '#FF9000'; }
    else if (s >= 140 || d >= 90) { category = 'High Blood Pressure Stage 2'; color = '#FF5A5A'; }
    if (s > 180 || d > 120) { category = 'Hypertensive Crisis — Seek emergency care!'; color = '#FF2222'; }
    setResult({ category, color });
  };
  return (
    <View style={styles.section}>
      <Field label="Systolic (mmHg)" value={systolic} onChange={setSystolic} colors={colors} />
      <Field label="Diastolic (mmHg)" value={diastolic} onChange={setDiastolic} colors={colors} />
      <CalcBtn onPress={calculate} colors={colors} />
      {result && (
        <ResCard colors={colors}>
          <Text style={[{ fontSize: 22, fontWeight: '700', color: result.color }]}>{systolic}/{diastolic} mmHg</Text>
          <Text style={[{ fontSize: 16, color: result.color }]}>{result.category}</Text>
        </ResCard>
      )}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────
//  Main Screen
// ──────────────────────────────────────────────────────────────
export function HealthCalculatorScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { colors } = useTheme();
  const [tool, setTool] = useState<HealthTool>('bmi');

  const renderTool = () => {
    const c = colors as Record<string, string>;
    switch (tool) {
      case 'bmi': return <BMITool colors={c} />;
      case 'bmr': return <BMRTool colors={c} />;
      case 'calorie': return <CalorieTool colors={c} />;
      case 'bodyfat': return <BodyFatTool colors={c} />;
      case 'idealweight': return <IdealWeightTool colors={c} />;
      case 'hydration': return <HydrationTool colors={c} />;
      case 'onerm': return <OneRMTool colors={c} />;
      case 'pregnancy': return <PregnancyTool colors={c} />;
      case 'bloodpressure': return <BloodPressureTool colors={c} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" style={styles.backBtn}>
          <Text style={[styles.backLabel, { color: colors.accentPrimary }]}>‹ Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Health Calculator</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolBar} contentContainerStyle={styles.toolBarContent}>
        {TOOLS.map((t) => (
          <Pressable key={t.id} onPress={() => setTool(t.id)} style={[styles.toolBtn, { backgroundColor: tool === t.id ? colors.accentPrimary : colors.bgSurface }]} accessibilityRole="tab" accessibilityLabel={t.label} accessibilityState={{ selected: tool === t.id }}>
            <Text style={[styles.toolBtnLabel, { color: tool === t.id ? '#FFF' : colors.textSecondary }]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>{renderTool()}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 4, gap: 8 },
  backBtn: { minWidth: 44, minHeight: 44, justifyContent: 'center' },
  backLabel: { fontSize: 17, fontWeight: '500' },
  title: { fontSize: 17, fontWeight: '600', flex: 1 },
  toolBar: { maxHeight: 52 },
  toolBarContent: { paddingHorizontal: 12, gap: 8, alignItems: 'center', paddingVertical: 8 },
  toolBtn: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  toolBtnLabel: { fontSize: 13, fontWeight: '600' },
  content: { padding: 16 },
  section: { gap: 8 },
  chip: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 7, alignItems: 'center' },
  chipLabel: { fontSize: 13, fontWeight: '600' },
  bmiBar: { flexDirection: 'row', borderRadius: 6, overflow: 'hidden', height: 10, marginTop: 8 },
  bmiSeg: { height: 10 },
});
