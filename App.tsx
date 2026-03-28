import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { RootNavigator } from '@/navigation/RootNavigator';
import { useSettingsStore } from '@/store/settingsStore';

function AppContent() {
  const theme = useSettingsStore((s) => s.theme);
  const statusBarStyle = theme === 'light' ? 'dark' : 'light';

  return (
    <>
      <RootNavigator />
      <StatusBar style={statusBarStyle} />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
