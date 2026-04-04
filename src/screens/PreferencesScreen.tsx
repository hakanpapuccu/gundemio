import { ScrollView, StyleSheet, View } from 'react-native';

import { appTheme } from '../theme';
import { Button, Chip, ScreenContainer, SectionHeader, SourceCard, SourceCardSkeleton } from '../components/ui';
import { DEMO_USER_ID } from '../constants/session';
import { useCategoriesQuery, useSourcesQuery, useUpsertPreferencesMutation, useUserPreferencesQuery } from '../hooks/queries';

export function PreferencesScreen() {
  const categoriesQuery = useCategoriesQuery();
  const sourcesQuery = useSourcesQuery({ page: 1, limit: 20 });
  const userPreferencesQuery = useUserPreferencesQuery({ userId: DEMO_USER_ID });
  const upsertPreferencesMutation = useUpsertPreferencesMutation();

  const selectedCategoryIds = userPreferencesQuery.data?.categoryIds ?? [];
  const selectedSourceIds = userPreferencesQuery.data?.sourceIds ?? [];

  const commitPreferences = (params: { categoryIds: string[]; sourceIds: string[] }) => {
    upsertPreferencesMutation.mutate({
      userId: DEMO_USER_ID,
      categoryIds: params.categoryIds,
      sourceIds: params.sourceIds,
    });
  };

  const toggleCategory = (categoryId: string) => {
    const nextCategoryIds = selectedCategoryIds.includes(categoryId)
      ? selectedCategoryIds.filter((id) => id !== categoryId)
      : [...selectedCategoryIds, categoryId];

    commitPreferences({
      categoryIds: nextCategoryIds,
      sourceIds: selectedSourceIds,
    });
  };

  const toggleSource = (sourceId: string) => {
    const nextSourceIds = selectedSourceIds.includes(sourceId)
      ? selectedSourceIds.filter((id) => id !== sourceId)
      : [...selectedSourceIds, sourceId];

    commitPreferences({
      categoryIds: selectedCategoryIds,
      sourceIds: nextSourceIds,
    });
  };

  const reset = () => {
    commitPreferences({
      categoryIds: [],
      sourceIds: [],
    });
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.section}>
        <SectionHeader title="Kategori Tercihleri" />
        <ScrollView
          contentContainerStyle={styles.chipsWrap}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {(categoriesQuery.data ?? []).map((category) => (
            <Chip
              key={category.id}
              label={category.name}
              onPress={() => toggleCategory(category.id)}
              selected={selectedCategoryIds.includes(category.id)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Kaynak Tercihleri" />
        <View style={styles.sourceList}>
          {sourcesQuery.isLoading ? (
            <>
              <SourceCardSkeleton />
              <SourceCardSkeleton />
              <SourceCardSkeleton />
            </>
          ) : (
            (sourcesQuery.data?.items ?? []).map((source) => (
              <SourceCard
                key={source.id}
                description={source.description ?? 'Haber kaynağı'}
                imageUrl={source.logoUrl}
                isFollowing={selectedSourceIds.includes(source.id)}
                name={source.name}
                onToggleFollow={() => toggleSource(source.id)}
              />
            ))
          )}
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
