import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import Svg, { Polyline, Line, Text as SvgText, G, Circle } from 'react-native-svg';
import { PinchGestureHandler, PanGestureHandler, State } from 'react-native-gesture-handler';
import { useTheme } from '@/hooks/useTheme';
import { useHistoryStore } from '@/store/historyStore';
import type { GraphFunction, GraphViewport } from '@/types';
import * as math from 'mathjs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_HEIGHT = 320;
const GRAPH_COLORS = ['#6C63FF', '#00D4FF', '#00E5A0', '#FFB547'];
const SAMPLES = 500;

function evaluateFunction(expr: string, x: number): number | null {
  try {
    const result = math.evaluate(expr.replace(/y\s*=\s*/, ''), { x });
    const num = typeof result === 'number' ? result : Number(math.number(result));
    return isFinite(num) ? num : null;
  } catch {
    return null;
  }
}

interface TooltipPoint { x: number; y: number; screenX: number; screenY: number; }

export function GraphingCalculatorScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { colors } = useTheme();
  const addEntry = useHistoryStore((s) => s.addEntry);

  const [functions, setFunctions] = useState<GraphFunction[]>([
    { id: '1', expression: 'x', color: GRAPH_COLORS[0], visible: true },
  ]);
  const [viewport, setViewport] = useState<GraphViewport>({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 });
  const [showGrid, setShowGrid] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipPoint | null>(null);
  const [showTable, setShowTable] = useState(false);

  const scaleBase = useRef(1);

  const mapToScreen = useCallback(
    (xVal: number, yVal: number): [number, number] => {
      const canvasWidth = SCREEN_WIDTH - 32;
      const sx = ((xVal - viewport.xMin) / (viewport.xMax - viewport.xMin)) * canvasWidth;
      const sy = ((viewport.yMax - yVal) / (viewport.yMax - viewport.yMin)) * CANVAS_HEIGHT;
      return [sx, sy];
    },
    [viewport]
  );

  const buildPath = useCallback(
    (fn: GraphFunction): string => {
      const canvasWidth = SCREEN_WIDTH - 32;
      const points: string[] = [];
      for (let i = 0; i <= SAMPLES; i++) {
        const x = viewport.xMin + (i / SAMPLES) * (viewport.xMax - viewport.xMin);
        const y = evaluateFunction(fn.expression, x);
        if (y === null || Math.abs(y) > Math.abs(viewport.yMax - viewport.yMin) * 3) continue;
        const [sx, sy] = mapToScreen(x, y);
        if (sx >= -10 && sx <= canvasWidth + 10) points.push(`${sx.toFixed(2)},${sy.toFixed(2)}`);
      }
      return points.join(' ');
    },
    [viewport, mapToScreen]
  );

  const [originX, originY] = mapToScreen(0, 0);
  const canvasWidth = SCREEN_WIDTH - 32;

  const addFunction = () => {
    if (functions.length >= 4) return;
    setFunctions((prev) => [
      ...prev,
      { id: String(prev.length + 1), expression: '', color: GRAPH_COLORS[prev.length], visible: true },
    ]);
  };

  const updateFunction = (id: string, expr: string) => {
    setFunctions((prev) => prev.map((f) => (f.id === id ? { ...f, expression: expr } : f)));
  };

  // Handle pan
  const lastPan = useRef({ x: 0, y: 0 });

  // Table of values data
  const tableData = () => {
    if (!functions[0]) return [];
    const rows = [];
    for (let x = Math.ceil(viewport.xMin); x <= Math.floor(viewport.xMax); x++) {
      const y = evaluateFunction(functions[0].expression, x);
      rows.push({ x, y: y !== null ? y.toFixed(4) : 'undef' });
    }
    return rows;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgBase }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" style={styles.backBtn}>
          <Text style={[styles.backLabel, { color: colors.accentPrimary }]}>‹ Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Graphing</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setShowGrid((v) => !v)}
            style={[styles.pill, { backgroundColor: showGrid ? colors.accentPrimary : colors.bgMuted }]}
            accessibilityRole="button"
            accessibilityLabel="Toggle grid"
          >
            <Text style={[styles.pillLabel, { color: showGrid ? '#FFF' : colors.textSecondary }]}>Grid</Text>
          </Pressable>
          <Pressable
            onPress={() => setShowTable((v) => !v)}
            style={[styles.pill, { backgroundColor: showTable ? colors.accentPrimary : colors.bgMuted }]}
            accessibilityRole="button"
            accessibilityLabel="Toggle table"
          >
            <Text style={[styles.pillLabel, { color: showTable ? '#FFF' : colors.textSecondary }]}>Table</Text>
          </Pressable>
        </View>
      </View>

      {/* Function inputs */}
      <View style={[styles.fnInputsContainer, { backgroundColor: colors.bgSurface }]}>
        {functions.map((fn) => (
          <View key={fn.id} style={styles.fnRow}>
            <View style={[styles.colorDot, { backgroundColor: fn.color }]} />
            <TextInput
              value={fn.expression}
              onChangeText={(t) => updateFunction(fn.id, t)}
              placeholder={`f(x) = e.g. x^2`}
              placeholderTextColor={colors.textDisabled}
              style={[styles.fnInput, { color: colors.textPrimary }]}
              accessibilityLabel={`Function ${fn.id} expression`}
            />
          </View>
        ))}
        {functions.length < 4 && (
          <Pressable onPress={addFunction} style={styles.addFnBtn} accessibilityRole="button" accessibilityLabel="Add function">
            <Text style={[styles.addFnLabel, { color: colors.accentPrimary }]}>+ Add Function</Text>
          </Pressable>
        )}
      </View>

      {showTable ? (
        <ScrollView style={styles.tableContainer}>
          <View style={[styles.tableHeader, { backgroundColor: colors.bgMuted }]}>
            <Text style={[styles.tableCell, { color: colors.textSecondary }]}>x</Text>
            <Text style={[styles.tableCell, { color: colors.textSecondary }]}>f(x)</Text>
          </View>
          {tableData().map((row) => (
            <View key={row.x} style={[styles.tableRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.tableCell, { color: colors.textPrimary }]}>{row.x}</Text>
              <Text style={[styles.tableCell, { color: colors.accentPrimary }]}>{row.y}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.canvasContainer}>
          <Svg width={canvasWidth} height={CANVAS_HEIGHT} style={styles.canvas}>
            {/* Grid lines */}
            {showGrid && (() => {
              const lines = [];
              for (let x = Math.ceil(viewport.xMin); x <= Math.floor(viewport.xMax); x++) {
                const [sx] = mapToScreen(x, 0);
                lines.push(
                  <Line key={`vg${x}`} x1={sx} y1={0} x2={sx} y2={CANVAS_HEIGHT}
                    stroke={colors.bgMuted} strokeWidth={x === 0 ? 1.5 : 0.5} />
                );
              }
              for (let y = Math.ceil(viewport.yMin); y <= Math.floor(viewport.yMax); y++) {
                const [, sy] = mapToScreen(0, y);
                lines.push(
                  <Line key={`hg${y}`} x1={0} y1={sy} x2={canvasWidth} y2={sy}
                    stroke={colors.bgMuted} strokeWidth={y === 0 ? 1.5 : 0.5} />
                );
              }
              return lines;
            })()}

            {/* Axes */}
            <Line x1={0} y1={originY} x2={canvasWidth} y2={originY} stroke={colors.textDisabled} strokeWidth={1.5} />
            <Line x1={originX} y1={0} x2={originX} y2={CANVAS_HEIGHT} stroke={colors.textDisabled} strokeWidth={1.5} />

            {/* Function curves */}
            {functions.filter((f) => f.visible && f.expression).map((fn) => {
              const points = buildPath(fn);
              return points ? (
                <Polyline key={fn.id} points={points} fill="none" stroke={fn.color} strokeWidth={2.5} />
              ) : null;
            })}

            {/* Tooltip */}
            {tooltip && (
              <G>
                <Circle cx={tooltip.screenX} cy={tooltip.screenY} r={5} fill={GRAPH_COLORS[0]} />
                <SvgText x={tooltip.screenX + 8} y={tooltip.screenY - 8} fill={colors.textPrimary} fontSize={11}>
                  ({tooltip.x.toFixed(2)}, {tooltip.y.toFixed(2)})
                </SvgText>
              </G>
            )}
          </Svg>

          {/* Viewport controls */}
          <View style={[styles.viewportRow, { backgroundColor: colors.bgSurface }]}>
            <Pressable
              onPress={() => setViewport((v) => ({
                xMin: v.xMin * 2, xMax: v.xMax * 2, yMin: v.yMin * 2, yMax: v.yMax * 2,
              }))}
              style={styles.viewportBtn}
              accessibilityRole="button"
              accessibilityLabel="Zoom out"
            >
              <Text style={[styles.viewportBtnLabel, { color: colors.textPrimary }]}>−</Text>
            </Pressable>
            <Text style={[styles.viewportLabel, { color: colors.textSecondary }]}>
              [{viewport.xMin}, {viewport.xMax}]
            </Text>
            <Pressable
              onPress={() => setViewport((v) => ({
                xMin: v.xMin / 2, xMax: v.xMax / 2, yMin: v.yMin / 2, yMax: v.yMax / 2,
              }))}
              style={styles.viewportBtn}
              accessibilityRole="button"
              accessibilityLabel="Zoom in"
            >
              <Text style={[styles.viewportBtnLabel, { color: colors.textPrimary }]}>+</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 4, gap: 8 },
  backBtn: { minWidth: 44, minHeight: 44, justifyContent: 'center' },
  backLabel: { fontSize: 17, fontWeight: '500' },
  title: { fontSize: 17, fontWeight: '600', flex: 1 },
  headerActions: { flexDirection: 'row', gap: 8 },
  pill: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  pillLabel: { fontSize: 12, fontWeight: '600' },
  fnInputsContainer: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, borderRadius: 0 },
  fnRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  fnInput: { flex: 1, fontSize: 16, fontFamily: 'System', minHeight: 36 },
  addFnBtn: { paddingVertical: 4 },
  addFnLabel: { fontSize: 14, fontWeight: '600' },
  canvasContainer: { flex: 1 },
  canvas: {},
  viewportRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 8, gap: 16 },
  viewportBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  viewportBtnLabel: { fontSize: 24, fontWeight: '300' },
  viewportLabel: { fontSize: 13 },
  tableContainer: { flex: 1 },
  tableHeader: { flexDirection: 'row', padding: 12 },
  tableRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1 },
  tableCell: { flex: 1, fontSize: 14 },
});
