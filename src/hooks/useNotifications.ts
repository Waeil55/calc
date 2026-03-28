/**
 * useNotifications — Expo Notifications wrapper for CalcPro Enterprise.
 * Handles permission requests, daily calculation reminders, and scheduling.
 */
import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

// Lazy-load expo-notifications to avoid crash when not installed
let Notifications: typeof import('expo-notifications') | null = null;

async function tryLoadNotifications() {
  if (Notifications) return Notifications;
  try {
    Notifications = await import('expo-notifications');
    // Configure how notifications appear when app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch {
    Notifications = null;
  }
  return Notifications;
}

const REMINDER_CHANNEL_ID = 'calcpro-daily-reminder';
const REMINDER_NOTIFICATION_ID = 'daily-calculation-reminder';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface UseNotifications {
  permissionStatus: PermissionStatus;
  requestPermission: () => Promise<boolean>;
  scheduleReminder: (hour?: number, minute?: number) => Promise<boolean>;
  cancelReminder: () => Promise<void>;
  cancelAll: () => Promise<void>;
  isAvailable: boolean;
}

export function useNotifications(): UseNotifications {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');
  const [isAvailable, setIsAvailable] = useState(false);

  // Check initial permission status on mount
  useEffect(() => {
    (async () => {
      const lib = await tryLoadNotifications();
      if (!lib) return;

      setIsAvailable(true);

      // Create Android notification channel
      if (Platform.OS === 'android') {
        await lib.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
          name: 'Daily Reminders',
          importance: lib.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250],
          lightColor: '#6C63FF',
        });
      }

      const { status } = await lib.getPermissionsAsync();
      setPermissionStatus(status as PermissionStatus);
    })();
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const lib = await tryLoadNotifications();
    if (!lib) return false;

    const { status } = await lib.requestPermissionsAsync();
    setPermissionStatus(status as PermissionStatus);
    return status === 'granted';
  }, []);

  const scheduleReminder = useCallback(
    async (hour = 9, minute = 0): Promise<boolean> => {
      const lib = await tryLoadNotifications();
      if (!lib) return false;

      // Ensure we have permission
      const { status } = await lib.getPermissionsAsync();
      if (status !== 'granted') {
        const granted = await requestPermission();
        if (!granted) return false;
      }

      // Cancel any existing reminder first
      await lib.cancelScheduledNotificationAsync(REMINDER_NOTIFICATION_ID).catch(() => null);

      await lib.scheduleNotificationAsync({
        identifier: REMINDER_NOTIFICATION_ID,
        content: {
          title: '🔢 CalcPro Enterprise',
          body: 'Time for your daily calculations! Open the app to get started.',
          sound: false,
          data: { type: 'daily-reminder' },
        },
        trigger: {
          type: lib.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: Platform.OS === 'android' ? REMINDER_CHANNEL_ID : undefined,
        } as Parameters<typeof lib.scheduleNotificationAsync>[0]['trigger'],
      });

      return true;
    },
    [requestPermission]
  );

  const cancelReminder = useCallback(async (): Promise<void> => {
    const lib = await tryLoadNotifications();
    if (!lib) return;
    await lib.cancelScheduledNotificationAsync(REMINDER_NOTIFICATION_ID).catch(() => null);
  }, []);

  const cancelAll = useCallback(async (): Promise<void> => {
    const lib = await tryLoadNotifications();
    if (!lib) return;
    await lib.cancelAllScheduledNotificationsAsync().catch(() => null);
  }, []);

  return {
    permissionStatus,
    requestPermission,
    scheduleReminder,
    cancelReminder,
    cancelAll,
    isAvailable,
  };
}
