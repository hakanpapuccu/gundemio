import { ScrollView, StyleSheet, View } from 'react-native';

import { usePreferencesStore } from '../store/usePreferencesStore';
import { appTheme } from '../theme';
import { Button, Chip, ScreenContainer, SectionHeader, SourceCard } from '../components/ui';

const categoryItems = [
  { id: 'gundem', label: 'Gündem' },
  { id: 'teknoloji', label: 'Teknoloji' },
  { id: 'ekonomi', label: 'Ekonomi' },
  { id: 'spor', label: 'Spor' },
  { id: 'dunya', label: 'Dünya' },
];

const sourceItems = [
  { id: 'cnn-turk', name: 'CNN Türk', description: 'Gündem • 1.2M Takipçi' },
  { id: 'webrazzi', name: 'Webrazzi', description: 'Teknoloji • 450K Takipçi' },
  { id: 'bloomberg-ht', name: 'Bloomberg HT', description: 'Ekonomi • 320K Takipçi' },
];

export function PreferencesScreen() {
  const selectedCategoryIds = usePreferencesStore((state) => state.selectedCategoryIds);
  const selectedSourceIds = usePreferencesStore((state) => state.selectedSourceIds);
  const toggleCategory = usePreferencesStore((state) => state.toggleCategory);
  const toggleSource = usePreferencesStore((state) => state.toggleSource);
  const reset = usePreferencesStore((state) => state.reset);

  return (
    <ScreenContainer scrollable>
      <View style={styles.section}>
        <SectionHeader title="Kategori Tercihleri" />
        <ScrollView
          contentContainerStyle={styles.chipsWrap}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {categoryItems.map((category) => (
            <Chip
              key={category.id}
              label={category.label}
              onPress={() => toggleCategory(category.id)}
              selected={selectedCategoryIds.includes(category.id)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Kaynak Tercihleri" />
        <View style={styles.sourceList}>
          {sourceItems.map((source) => (
            <SourceCard
              key={source.id}
              description={source.description}
              isFollowing={selectedSourceIds.includes(source.id)}
              name={source.name}
              onToggleFollow={() => toggleSource(source.id)}
            />
          ))}
        </View>
      </View>

      <Button fullWidth label="Tercihleri Sıfırla" onPress={reset} size="lg" variant="ghost" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: appTheme.spacing.md,
  },
  chipsWrap: {
    gap: appTheme.spacing.sm,
  },
  sourceList: {
    backgroundColor: appTheme.colors.surface,
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radii.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
