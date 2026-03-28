import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { CalcStackNavigator } from './CalcStackNavigator';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { UnitConverterScreen } from '@/screens/UnitConverterScreen';
import { CurrencyConverterScreen } from '@/screens/CurrencyConverterScreen';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export type TabParamList = {
  Calculators: undefined;
  Converter: undefined;
  Currency: undefined;
  History: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<string, string> = {
  Calculators: '🧮',
  Converter: '⇄',
  Currency: '💱',
  History: '📋',
  Settings: '⚙️',
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBarWrapper,
        { bottom: insets.bottom + 12 },
      ]}
    >
      <View style={[styles.tabBar, { backgroundColor: colors.bgSurface + 'EE', borderColor: colors.border }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? route.name}
              style={[
                styles.tabItem,
                isFocused && { backgroundColor: colors.accentPrimary + '22' },
                { minWidth: 44, minHeight: 44 },
              ]}
            >
              <Text style={styles.icon}>{TAB_ICONS[route.name] ?? '•'}</Text>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? colors.accentPrimary : colors.textSecondary },
                ]}
              >
                {route.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Calculators" component={CalcStackNavigator} />
      <Tab.Screen name="Converter" component={UnitConverterScreen} />
      <Tab.Screen name="Currency" component={CurrencyConverterScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 28,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 6,
    gap: 2,
  },
  icon: { fontSize: 18 },
  tabLabel: { fontSize: 10, fontWeight: '600' },
});
