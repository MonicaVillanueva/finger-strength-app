/**
 * app/modal.tsx
 * Brief: Shared modal component used for app-level dialogs and overlays.
 * Exports: modal wrapper component used by routes to show transient content.
 */
import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

/**
 * A shared modal component used for app-level dialogs and overlays.
 * Renders a themed view with a title and a link to dismiss the modal.
 * @returns {JSX.Element} A themed view with a title and a link to dismiss the modal.
 */
export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">This is a modal</ThemedText>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link">Go to home screen</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
