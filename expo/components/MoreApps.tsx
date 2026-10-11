// components/MoreApps.tsx
// The "More from Simon Shih" list at the foot of Profile. Three sibling apps,
// each opening its App Store page. Built from the same recentItem row pattern
// already on that screen so it reads as part of it.
//
// No network: the list is static data from lib/moreApps.

import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { ExternalLink } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { FleetApp, relatedApps, storeUrl } from '@/lib/moreApps';

export default function MoreApps() {
  const apps = relatedApps();
  if (apps.length === 0) return null;

  const open = (app: FleetApp) => {
    // openURL rejects when nothing can handle the scheme; nothing useful to say.
    Linking.openURL(storeUrl(app)).catch(() => {});
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionTitle}>More from Simon Shih</Text>
      <View style={styles.list}>
        {apps.map((app, i) => (
          <Pressable
            key={app.key}
            style={i === apps.length - 1 ? styles.itemLast : styles.item}
            onPress={() => open(app)}
            accessibilityRole="link"
            accessibilityLabel={`${app.name}, ${app.line}. Opens the App Store.`}
          >
            <ExternalLink size={18} color={Colors.textSecondary} />
            <View style={styles.body}>
              <Text style={styles.title}>{app.name}</Text>
              <Text style={styles.sub}>{app.line}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 8 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  list: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  itemLast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  body: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600' as const, color: Colors.text },
  sub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});
