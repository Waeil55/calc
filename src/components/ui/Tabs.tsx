import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface TabItem {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export const Tabs = React.memo(function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            style={[
              styles.tab,
              {
                backgroundColor: isActive ? colors.accentPrimary : colors.bgMuted,
                minWidth: 44,
                minHeight: 36,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: isActive ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: { flexGrow: 0 },
  content: { paddingHorizontal: 12, paddingVertical: 8, gap: 8, flexDirection: 'row' },
  tab: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  label: { fontSize: 13, fontWeight: '600' },
});
