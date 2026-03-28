import React, { useState, useEffect } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import {
  differenceInDays,
  differenceInYears,
  differenceInMonths,
  differenceInHours,
  differenceInMinutes,
  addDays,
  addMonths,
  addYears,
  addHours,
  addMinutes,
  format,
  getDay,
  getWeek,
  fromUnixTime,
  getUnixTime,
} from 'date-fns';
import { useTheme } from '@/hooks/useTheme';

type DTTool =
  | 'diff'
  | 'add'
  | 'age'
  | 'dayofweek'
  | 'weeknum'
  | 'worldclock'
  | 'countdown'
  | 'duration'
  | 'unix';

const TOOLS: { id: DTTool; label: string }[] = [
  { id: 'diff', label: 'Date Diff' },
  { id: 'add', label: 'Add/Sub' },
  { id: 'age', label: 'Age' },
  { id: 'dayofweek', label: 'Day of Week' },
  { id: 'weeknum', label: 'Week #' },
  { id: 'worldclock', label: 'World Clock' },
  { id: 'countdown', label: 'Countdown' },
  { id: 'duration', label: 'Duration' },
  { id: 'unix', label: 'Unix Time' },
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const WORLD_ZONES = [
  { city: 'New York', tz: 'America/New_York' },
  { city: 'London', tz: 'Europe/London' },
  { city: 'Paris', tz: 'Europe/Paris' },
  { city: 'Dubai', tz: 'Asia/Dubai' },
  { city: 'Mumbai', tz: 'Asia/Kolkata' },
  { city: 'Singapore', tz: 'Asia/Singapore' },
  { city: 'Tokyo', tz: 'Asia/Tokyo' },
  { city: 'Sydney', tz: 'Australia/Sydney' },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={rowStyles.container}>
      <Text style={rowStyles.label}>{label}</Text>
      {children}
    </View>
  );
}
const rowStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, gap: 12 },
  label: { fontSize: 14, color: '#888', flex: 1 },
});

function DInput({ value, onChange, colors }: { value: string; onChange: (v: string) => void; colors: Record<string, string> }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder="YYYY-MM-DD"
      placeholderTextColor={colors.textDisabled}
      style={[dateStyles.input, { color: colors.textPrimary, borderColor: colors.border }]}
      accessibilityLabel="Date input"
    />
  );
}
const dateStyles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 10, padding: 8, fontSize: 15, width: 140, textAlign: 'right' },
});

function ResCard({ children, colors }: { children: React.ReactNode; colors: Record<string, string> }) {
  return <View style={[rcStyles.card, { backgroundColor: colors.bgSurface }]}>{children}</View>;
}
const rcStyles = StyleSheet.create({ card: { borderRadius: 16, padding: 16, gap: 6, marginTop: 8 } });

function ResLine({ label, value, colors }: { label: string; value: string; colors: Record<string, string> }) {
  return (
    <View style={rlStyles.row}>
      <Text style={[rlStyles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[rlStyles.value, { color: colors.textPrimary }]}>{value}</Text>
    </View>
  );
}
const rlStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 13 },
  value: { fontSize: 14, fontWeight: '600' },
});

function CalcBtn({ onPress, colors }: { onPress: () => void; colors: Record<string, string> }) {
  return (
    <Pressable onPress={onPress} style={[btnStyles.btn, { backgroundColor: colors.accentPrimary }]} accessibilityRole="button" accessibilityLabel="Calculate">
      <Text style={btnStyles.label}>Calculate</Text>
    </Pressable>
  );
}
const btnStyles = StyleSheet.create({
  btn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  label: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

// ──────────────────────────────────────────────────────────────
//  Tool components
// ──────────────────────────────────────────────────────────────
function DateDiffTool({ colors }: { colors: Record<string, string> }) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [result, setResult] = useState<null | { years: number; months: number; days: number; totalDays: number; hours: number }>(null);
  const calculate = () => {
    const s = new Date(start), e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return;
    const [from, to] = s <= e ? [s, e] : [e, s];
    setResult({
      years: differenceInYears(to, from),
      months: differenceInMonths(to, from),
      days: differenceInDays(to, from) % 30,
      totalDays: differenceInDays(to, from),
      hours: differenceInHours(to, from),
    });
  };
  return (
    <View style={styles.section}>
      <Row label="Start date"><DInput value={start} onChange={setStart} colors={colors} /></Row>
      <Row label="End date"><DInput value={end} onChange={setEnd} colors={colors} /></Row>
      <CalcBtn onPress={calculate} colors={colors} />
      {result && (
        <ResCard colors={colors}>
          <ResLine label="Total days" value={String(result.totalDays)} colors={colors} />
          <ResLine label="Years" value={String(result.years)} colors={colors} />
          <ResLine label="Months" value={String(result.months)} colors={colors} />
          <ResLine label="Total hours" value={String(result.hours)} colors={colors} />
        </ResCard>
      )}
    </View>
  );
}

function AddSubTool({ colors }: { colors: Record<string, string> }) {
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState<'days' | 'months' | 'years' | 'hours' | 'minutes'>('days');
  const [direction, setDirection] = useState<'add' | 'sub'>('add');
  const [result, setResult] = useState('');
  const UNITS = ['days', 'months', 'years', 'hours', 'minutes'] as const;
  const calculate = () => {
    const d = new Date(date);
    const n = parseInt(amount);
    if (isNaN(d.getTime()) || isNaN(n)) return;
    const sign = direction === 'add' ? 1 : -1;
    let res: Date;
    switch (unit) {
      case 'days': res = addDays(d, n * sign); break;
      case 'months': res = addMonths(d, n * sign); break;
      case 'years': res = addYears(d, n * sign); break;
      case 'hours': res = addHours(d, n * sign); break;
      case 'minutes': res = addMinutes(d, n * sign); break;
    }
    setResult(format(res, 'EEEE, MMMM do yyyy'));
  };
  return (
    <View style={styles.section}>
      <Row label="Start date"><DInput value={date} onChange={setDate} colors={colors} /></Row>
      <Row label="Amount">
        <TextInput value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.textDisabled} style={[dateStyles.input, { color: colors.textPrimary, borderColor: colors.border }]} accessibilityLabel="Amount" />
      </Row>
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        {UNITS.map((u) => (
          <Pressable key={u} onPress={() => setUnit(u)} style={[styles.chip, { backgroundColor: unit === u ? colors.accentPrimary : colors.bgSurface }]} accessibilityRole="button" accessibilityLabel={u} accessibilityState={{ selected: unit === u }}>
            <Text style={[styles.chipLabel, { color: unit === u ? '#FFF' : colors.textSecondary }]}>{u}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => setDirection('add')} style={[styles.chip, { backgroundColor: direction === 'add' ? '#00E5A0' : colors.bgSurface }]} accessibilityRole="button" accessibilityLabel="Add" accessibilityState={{ selected: direction === 'add' }}>
          <Text style={[styles.chipLabel, { color: direction === 'add' ? '#000' : colors.textSecondary }]}>+ Add</Text>
        </Pressable>
        <Pressable onPress={() => setDirection('sub')} style={[styles.chip, { backgroundColor: direction === 'sub' ? '#FF5A5A' : colors.bgSurface }]} accessibilityRole="button" accessibilityLabel="Subtract" accessibilityState={{ selected: direction === 'sub' }}>
          <Text style={[styles.chipLabel, { color: direction === 'sub' ? '#FFF' : colors.textSecondary }]}>− Sub</Text>
        </Pressable>
      </View>
      <CalcBtn onPress={calculate} colors={colors} />
      {!!result && <ResCard colors={colors}><Text style={[{ color: colors.accentPrimary, fontSize: 20, fontWeight: '700' }]}>{result}</Text></ResCard>}
    </View>
  );
}

function AgeTool({ colors }: { colors: Record<string, string> }) {
  const [dob, setDob] = useState('');
  const [result, setResult] = useState<null | { years: number; months: number; days: number; nextBirthday: number }>(null);
  const calculate = () => {
    const d = new Date(dob);
    const now = new Date();
    if (isNaN(d.getTime())) return;
    const years = differenceInYears(now, d);
    const months = differenceInMonths(now, d) % 12;
    const days = differenceInDays(now, addMonths(addYears(d, years), months));
    const nextBday = new Date(d);
    nextBday.setFullYear(now.getFullYear());
    if (nextBday <= now) nextBday.setFullYear(now.getFullYear() + 1);
    const nextBirthday = differenceInDays(nextBday, now);
    setResult({ years, months, days, nextBirthday });
  };
  return (
    <View style={styles.section}>
      <Row label="Date of birth"><DInput value={dob} onChange={setDob} colors={colors} /></Row>
      <CalcBtn onPress={calculate} colors={colors} />
      {result && (
        <ResCard colors={colors}>
          <Text style={[{ color: colors.accentPrimary, fontSize: 36, fontWeight: '700' }]}>{result.years}</Text>
          <Text style={[{ color: colors.textSecondary, fontSize: 14 }]}>years old</Text>
          <ResLine label="Months" value={String(result.months)} colors={colors} />
          <ResLine label="Days" value={String(result.days)} colors={colors} />
          <ResLine label="Next birthday in" value={`${result.nextBirthday} days`} colors={colors} />
        </ResCard>
      )}
    </View>
  );
}

function DayOfWeekTool({ colors }: { colors: Record<string, string> }) {
  const [date, setDate] = useState('');
  const [result, setResult] = useState('');
  const calculate = () => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return;
    setResult(`${DAY_NAMES[getDay(d)]} — ${format(d, 'MMMM do, yyyy')}`);
  };
  return (
    <View style={styles.section}>
      <Row label="Date"><DInput value={date} onChange={setDate} colors={colors} /></Row>
      <CalcBtn onPress={calculate} colors={colors} />
      {!!result && <ResCard colors={colors}><Text style={[{ color: colors.accentPrimary, fontSize: 22, fontWeight: '700' }]}>{result}</Text></ResCard>}
    </View>
  );
}

function WeekNumTool({ colors }: { colors: Record<string, string> }) {
  const [date, setDate] = useState('');
  const [result, setResult] = useState('');
  const calculate = () => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return;
    setResult(`Week ${getWeek(d)} of ${d.getFullYear()}`);
  };
  return (
    <View style={styles.section}>
      <Row label="Date"><DInput value={date} onChange={setDate} colors={colors} /></Row>
      <CalcBtn onPress={calculate} colors={colors} />
      {!!result && <ResCard colors={colors}><Text style={[{ color: colors.accentPrimary, fontSize: 24, fontWeight: '700' }]}>{result}</Text></ResCard>}
    </View>
  );
}

function WorldClockTool({ colors }: { colors: Record<string, string> }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <View style={styles.section}>
      {WORLD_ZONES.map((z) => {
        const timeStr = now.toLocaleTimeString('en-US', { timeZone: z.tz, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = now.toLocaleDateString('en-US', { timeZone: z.tz, weekday: 'short', month: 'short', day: 'numeric' });
        return (
          <View key={z.city} style={[styles.clockRow, { backgroundColor: colors.bgSurface }]}>
            <Text style={[styles.clockCity, { color: colors.textPrimary }]}>{z.city}</Text>
            <View>
              <Text style={[styles.clockTime, { color: colors.accentPrimary }]}>{timeStr}</Text>
              <Text style={[styles.clockDate, { color: colors.textSecondary }]}>{dateStr}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function CountdownTool({ colors }: { colors: Record<string, string> }) {
  const [target, setTarget] = useState('');
  const [remaining, setRemaining] = useState<null | { d: number; h: number; m: number; s: number }>(null);
  useEffect(() => {
    if (!target) return;
    const timer = setInterval(() => {
      const t = new Date(target);
      const now = new Date();
      if (isNaN(t.getTime()) || t <= now) { setRemaining({ d: 0, h: 0, m: 0, s: 0 }); return; }
      const diff = Math.floor((t.getTime() - now.getTime()) / 1000);
      setRemaining({ d: Math.floor(diff / 86400), h: Math.floor((diff % 86400) / 3600), m: Math.floor((diff % 3600) / 60), s: diff % 60 });
    }, 1000);
    return () => clearInterval(timer);
  }, [target]);
  return (
    <View style={styles.section}>
      <Row label="Target date/time">
        <TextInput value={target} onChangeText={setTarget} placeholder="YYYY-MM-DDTHH:MM" placeholderTextColor={colors.textDisabled} style={[dateStyles.input, { color: colors.textPrimary, borderColor: colors.border }]} accessibilityLabel="Countdown target" />
      </Row>
      {remaining && (
        <ResCard colors={colors}>
          <View style={{ flexDirection: 'row', gap: 16, justifyContent: 'center' }}>
            {[['Days', remaining.d], ['Hours', remaining.h], ['Mins', remaining.m], ['Secs', remaining.s]].map(([l, v]) => (
              <View key={String(l)} style={{ alignItems: 'center' }}>
                <Text style={[{ color: colors.accentPrimary, fontSize: 32, fontWeight: '700' }]}>{String(v).padStart(2, '0')}</Text>
                <Text style={[{ color: colors.textSecondary, fontSize: 11 }]}>{l}</Text>
              </View>
            ))}
          </View>
        </ResCard>
      )}
    </View>
  );
}

function DurationTool({ colors }: { colors: Record<string, string> }) {
  const [h, setH] = useState(''); const [m, setM] = useState(''); const [s, setS] = useState('');
  const [h2, setH2] = useState(''); const [m2, setM2] = useState(''); const [s2, setS2] = useState('');
  const [result, setResult] = useState('');
  const calculate = () => {
    const t1 = (parseInt(h) || 0) * 3600 + (parseInt(m) || 0) * 60 + (parseInt(s) || 0);
    const t2 = (parseInt(h2) || 0) * 3600 + (parseInt(m2) || 0) * 60 + (parseInt(s2) || 0);
    const diff = Math.abs(t2 - t1);
    const dh = Math.floor(diff / 3600), dm = Math.floor((diff % 3600) / 60), ds = diff % 60;
    setResult(`${dh}h ${dm}m ${ds}s  (${diff} seconds total)`);
  };
  return (
    <View style={styles.section}>
      <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Time 1 (H M S)</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {([[h, setH], [m, setM], [s, setS]] as const).map(([v, setter], i) => (
          <TextInput key={i} value={v as string} onChangeText={setter as (t: string) => void} keyboardType="number-pad" placeholder={['HH', 'MM', 'SS'][i]} placeholderTextColor={colors.textDisabled} style={[styles.timeField, { color: colors.textPrimary, borderColor: colors.border }]} accessibilityLabel={['Hours 1', 'Minutes 1', 'Seconds 1'][i]} />
        ))}
      </View>
      <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Time 2 (H M S)</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {([[h2, setH2], [m2, setM2], [s2, setS2]] as const).map(([v, setter], i) => (
          <TextInput key={i} value={v as string} onChangeText={setter as (t: string) => void} keyboardType="number-pad" placeholder={['HH', 'MM', 'SS'][i]} placeholderTextColor={colors.textDisabled} style={[styles.timeField, { color: colors.textPrimary, borderColor: colors.border }]} accessibilityLabel={['Hours 2', 'Minutes 2', 'Seconds 2'][i]} />
        ))}
      </View>
      <CalcBtn onPress={calculate} colors={colors} />
      {!!result && <ResCard colors={colors}><Text style={[{ color: colors.accentPrimary, fontSize: 18, fontWeight: '600' }]}>{result}</Text></ResCard>}
    </View>
  );
}

function UnixTool({ colors }: { colors: Record<string, string> }) {
  const [unix, setUnix] = useState('');
  const [date, setDate] = useState('');
  const [unixResult, setUnixResult] = useState('');
  const [dateResult, setDateResult] = useState('');
  const convertUnix = () => {
    const u = parseInt(unix);
    if (isNaN(u)) return;
    const d = fromUnixTime(u);
    setUnixResult(format(d, 'EEEE, MMMM do yyyy HH:mm:ss'));
  };
  const convertDate = () => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return;
    setDateResult(String(getUnixTime(d)));
  };
  return (
    <View style={styles.section}>
      <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Unix timestamp → Date</Text>
      <Row label="Timestamp">
        <TextInput value={unix} onChangeText={setUnix} keyboardType="number-pad" placeholder="e.g. 1700000000" placeholderTextColor={colors.textDisabled} style={[dateStyles.input, { color: colors.textPrimary, borderColor: colors.border }]} accessibilityLabel="Unix timestamp" />
      </Row>
      <CalcBtn onPress={convertUnix} colors={colors} />
      {!!unixResult && <ResCard colors={colors}><Text style={[{ color: colors.accentPrimary, fontSize: 16, fontWeight: '600' }]}>{unixResult}</Text></ResCard>}
      <Text style={[styles.subLabel, { color: colors.textSecondary, marginTop: 16 }]}>Date → Unix timestamp</Text>
      <Row label="Date"><DInput value={date} onChange={setDate} colors={colors} /></Row>
      <CalcBtn onPress={convertDate} colors={colors} />
      {!!dateResult && <ResCard colors={colors}><Text style={[{ color: colors.accentPrimary, fontSize: 24, fontWeight: '700' }]}>{dateResult}</Text></ResCard>}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────
//  Main Screen
// ──────────────────────────────────────────────────────────────
export function DateTimeCalculatorScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { colors } = useTheme();
  const [tool, setTool] = useState<DTTool>('diff');

  const renderTool = () => {
    const c = colors as Record<string, string>;
    switch (tool) {
      case 'diff': return <DateDiffTool colors={c} />;
      case 'add': return <AddSubTool colors={c} />;
      case 'age': return <AgeTool colors={c} />;
      case 'dayofweek': return <DayOfWeekTool colors={c} />;
      case 'weeknum': return <WeekNumTool colors={c} />;
      case 'worldclock': return <WorldClockTool colors={c} />;
      case 'countdown': return <CountdownTool colors={c} />;
      case 'duration': return <DurationTool colors={c} />;
      case 'unix': return <UnixTool colors={c} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" style={styles.backBtn}>
          <Text style={[styles.backLabel, { color: colors.accentPrimary }]}>‹ Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Date & Time</Text>
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
  chip: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipLabel: { fontSize: 12, fontWeight: '600' },
  clockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 12, padding: 12, marginBottom: 8 },
  clockCity: { fontSize: 15, fontWeight: '600' },
  clockTime: { fontSize: 20, fontWeight: '700', textAlign: 'right' },
  clockDate: { fontSize: 12, textAlign: 'right' },
  subLabel: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  timeField: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 8, fontSize: 18, textAlign: 'center' },
});
