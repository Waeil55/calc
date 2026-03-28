import React, { useState, useRef } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Text,
  Pressable,
  Dimensions,
  FlatList,
  Animated,
  StatusBar,
} from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  bg: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    title: 'CalcPro Enterprise',
    subtitle: 'The most powerful calculator\nyou\'ll ever need.',
    emoji: '⚡',
    bg: '#0A0A0F',
  },
  {
    id: '2',
    title: '10 Calculator Modes',
    subtitle: 'Basic · Scientific · Graphing\nFinancial · Programmer · Stats\nMatrix · Equations · Date & Health',
    emoji: '🧮',
    bg: '#0D0A1F',
  },
  {
    id: '3',
    title: 'Beautiful by Design',
    subtitle: 'Dark-first UI with 6 accent colors.\nFluid animations. Haptic feedback.',
    emoji: '🎨',
    bg: '#0A1020',
  },
  {
    id: '4',
    title: 'History & Export',
    subtitle: 'Every calculation saved.\nSearch, filter, and export to CSV.',
    emoji: '📋',
    bg: '#0A1508',
  },
  {
    id: '5',
    title: 'Start Calculating',
    subtitle: 'Ready? Let\'s go.',
    emoji: '🚀',
    bg: '#150A0F',
  },
];

const ACCENT = '#6C63FF';

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { setTheme } = useSettingsStore();

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const skip = () => {
    onComplete();
  };

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        renderItem={({ item }: { item: Slide }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH, backgroundColor: item.bg }]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Bottom controls */}
      <SafeAreaView style={styles.controls}>
        {/* Dot indicators */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i === currentIndex ? ACCENT : '#333' }]} />
          ))}
        </View>

        {/* Theme selection on last slide */}
        {isLast && (
          <View style={styles.themeRow}>
            <Text style={styles.themeLabel}>Choose your theme:</Text>
            <View style={styles.themeButtons}>
              <Pressable
                onPress={() => setTheme('dark')}
                style={[styles.themeBtn, styles.darkBtn]}
                accessibilityRole="button"
                accessibilityLabel="Dark theme"
              >
                <Text style={styles.themeBtnLabel}>🌙 Dark</Text>
              </Pressable>
              <Pressable
                onPress={() => setTheme('light')}
                style={[styles.themeBtn, styles.lightBtn]}
                accessibilityRole="button"
                accessibilityLabel="Light theme"
              >
                <Text style={[styles.themeBtnLabel, { color: '#000' }]}>☀️ Light</Text>
              </Pressable>
              <Pressable
                onPress={() => setTheme('system')}
                style={[styles.themeBtn, styles.systemBtn]}
                accessibilityRole="button"
                accessibilityLabel="System theme"
              >
                <Text style={styles.themeBtnLabel}>📱 System</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.btns}>
          {!isLast && (
            <Pressable onPress={skip} style={styles.skipBtn} accessibilityRole="button" accessibilityLabel="Skip onboarding">
              <Text style={styles.skipLabel}>Skip</Text>
            </Pressable>
          )}
          <Pressable
            onPress={goNext}
            style={[styles.nextBtn, { backgroundColor: ACCENT }]}
            accessibilityRole="button"
            accessibilityLabel={isLast ? 'Get started' : 'Next'}
          >
            <Text style={styles.nextLabel}>{isLast ? 'Get Started →' : 'Next →'}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 24 },
  emoji: { fontSize: 80 },
  slideTitle: { fontSize: 32, fontWeight: '800', color: '#FFF', textAlign: 'center' },
  slideSubtitle: { fontSize: 16, color: '#AAA', textAlign: 'center', lineHeight: 26 },
  controls: { paddingHorizontal: 24, paddingBottom: 24, gap: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  themeRow: { alignItems: 'center', gap: 12 },
  themeLabel: { color: '#888', fontSize: 14 },
  themeButtons: { flexDirection: 'row', gap: 12 },
  themeBtn: { borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 },
  darkBtn: { backgroundColor: '#1A1A2E' },
  lightBtn: { backgroundColor: '#F0F0F0' },
  systemBtn: { backgroundColor: '#2A2A3E' },
  themeBtnLabel: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  btns: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skipBtn: { padding: 12 },
  skipLabel: { color: '#666', fontSize: 15 },
  nextBtn: { borderRadius: 24, paddingHorizontal: 32, paddingVertical: 16, flex: 1, alignItems: 'center' },
  nextLabel: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
