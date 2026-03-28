import React from 'react';
import {
  Modal as RNModal,
  View,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal = React.memo(function Modal({ visible, onClose, children }: ModalProps) {
  const { colors } = useTheme();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose} accessibilityRole="button" accessibilityLabel="Close modal">
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View
        style={[
          styles.sheet,
          { backgroundColor: colors.bgElevated, borderColor: colors.border },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.bgMuted }]} />
        {children}
      </View>
    </RNModal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    padding: 24,
    paddingTop: 12,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
});
