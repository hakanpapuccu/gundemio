import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { RootStackScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { EmptyState, ScreenContainer, SearchBar, SourceCard, SourceCardSkeleton, TopAppBar } from '../components/ui';
import { DEMO_USER_ID } from '../constants/session';
import { useCategoriesQuery, useSourcesQuery, useUpsertPreferencesMutation, useUserPreferencesQuery } from '../hooks/queries';

type SourceTabKey = 'all' | 'followed' | 'recommended';

const SOURCE_TABS: { key: SourceTabKey; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'followed', label: 'Takip Ettiklerim' },
  { key: 'recommended', label: 'Önerilen' },
];

export function SourcesScreen({ navigation, route }: RootStackScreenProps<'Sources'>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SourceTabKey>('all');

  const normalizedSearch = searchQuery.trim();
  const categoryScopeIds = useMemo(
    () => (route.params?.categoryId ? [route.params.categoryId] : undefined),
    [route.params?.categoryId]
  );

  const categoriesQuery = useCategoriesQuery();
  const userPreferencesQuery = useUserPreferencesQuery({ userId: DEMO_USER_ID });
  const upsertPreferencesMutation = useUpsertPreferencesMutation();

  const selectedSourceIds = useMemo(
    () => userPreferencesQuery.data?.sourceIds ?? [],
    [userPreferencesQuery.data?.sourceIds]
  );
  const selectedCategoryIds = useMemo(
    () => userPreferencesQuery.data?.categoryIds ?? [],
    [userPreferencesQuery.data?.categoryIds]
  );

  const sourceQueryCategoryIds = useMemo(() => {
    if (activeTab === 'recommended') {
      if (selectedCategoryIds.length > 0) {
        return selectedCategoryIds;
      }
      return categoryScopeIds;
    }

    return categoryScopeIds;
  }, [activeTab, categoryScopeIds, selectedCategoryIds]);

  const sourceQuerySourceIds = activeTab === 'followed' ? selectedSourceIds : undefined;
  const shouldFetchSources = activeTab !== 'followed' || selectedSourceIds.length > 0;

  const sourcesQuery = useSourcesQuery(
    {
      page: 1,
      limit: 50,
      categoryIds: sourceQueryCategoryIds,
      sourceIds: sourceQuerySourceIds,
      search: normalizedSearch || undefined,
      sortBy: 'name_asc',
    },
    {
      enabled: shouldFetchSources,
    }
  );

  const categoryNameById = useMemo(
    () =>
      (categoriesQuery.data ?? []).reduce<Record<string, string>>((acc, category) => {
        acc[category.id] = category.name;
        return acc;
      }, {}),
    [categoriesQuery.data]
  );

  const sourceItems = useMemo(() => {
    const items = sourcesQuery.data?.items ?? [];
    if (activeTab === 'recommended') {
      return items.filter((source) => !selectedSourceIds.includes(source.id));
    }
    return items;
  }, [activeTab, selectedSourceIds, sourcesQuery.data?.items]);

  const handleToggleFollow = (sourceId: string) => {
    const nextSourceIds = selectedSourceIds.includes(sourceId)
      ? selectedSourceIds.filter((id) => id !== sourceId)
      : [...selectedSourceIds, sourceId];

    upsertPreferencesMutation.mutate({
      userId: DEMO_USER_ID,
      categoryIds: selectedCategoryIds,
      sourceIds: nextSourceIds,
    });
  };

  const isLoading = userPreferencesQuery.isLoading || (shouldFetchSources && sourcesQuery.isLoading);

  const getEmptyState = () => {
    if (activeTab === 'followed') {
      return {
        title: 'Takip edilen kaynak yok',
        description: 'Haber kaynaklarını takip ederek bu listeyi oluşturabilirsin.',
      };
    }

    if (activeTab === 'recommended') {
      return {
        title: 'Öneri bulunamadı',
        description: 'Tercihlerinle eşleşen yeni bir kaynak şu an bulunmuyor.',
      };
    }

    return {
      title: 'Kaynak bulunamadı',
      description: 'Farklı bir arama kelimesiyle tekrar deneyebilirsin.',
    };
  };

  return (
    <ScreenContainer style={styles.container} withHorizontalPadding={false}>
      <TopAppBar
        leftIcon="arrow-back"
        onPressLeft={() => navigation.goBack()}
        title={route.params?.categoryName ? `${route.params.categoryName} Kaynakları` : 'Kaynaklar'}
      />

      <View style={styles.searchWrap}>
        <SearchBar onChangeText={setSearchQuery} onClear={() => setSearchQuery('')} value={searchQuery} />
      </View>

      <View style={styles.tabsRow}>
        {SOURCE_TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.listWrap}>
        {isLoading ? (
          <View style={styles.loadingList}>
            <SourceCardSkeleton />
            <SourceCardSkeleton />
            <SourceCardSkeleton />
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={sourceItems}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <EmptyState
                description={getEmptyState().description}
                icon="newspaper"
                title={getEmptyState().title}
              />
            }
            renderItem={({ item }) => {
              const categoryName = item.categoryId ? categoryNameById[item.categoryId] : null;
              const descriptionParts = [categoryName, item.description].filter(Boolean);
              return (
                <SourceCard
                  description={descriptionParts.join(' • ') || 'Haber kaynağı'}
                  imageUrl={item.logoUrl}
                  isFollowing={selectedSourceIds.includes(item.id)}
                  name={item.name}
                  onPress={() =>
                    navigation.navigate('SourceDetail', {
                      sourceId: item.id,
                      sourceName: item.name,
                    })
                  }
                  onToggleFollow={() => handleToggleFollow(item.id)}
                />
              );
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: appTheme.colors.background,
  },
  searchWrap: {
    paddingHorizontal: appTheme.spacing.lg,
    paddingTop: appTheme.spacing.sm,
  },
  tabsRow: {
    borderBottomColor: appTheme.colors.borderSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginTop: appTheme.spacing.sm,
    paddingHorizontal: appTheme.spacing.lg,
  },
  tabButton: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 3,
    paddingBottom: appTheme.spacing.md,
    paddingRight: appTheme.spacing.lg,
    paddingTop: appTheme.spacing.md,
  },
  tabButtonActive: {
    borderBottomColor: appTheme.colors.primary,
  },
  tabLabel: {
    color: appTheme.colors.textMuted,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.md,
    fontWeight: appTheme.typography.fontWeight.bold,
    lineHeight: appTheme.typography.lineHeight.md,
  },
  tabLabelActive: {
    color: appTheme.colors.primary,
  },
  listWrap: {
    flex: 1,
  },
  loadingList: {
    gap: appTheme.spacing.xs,
    paddingTop: appTheme.spacing.xs,
  },
  listContent: {
    paddingBottom: appTheme.spacing.xxxl,
    paddingTop: appTheme.spacing.xs,
  },
});
