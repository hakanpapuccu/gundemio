import fs from 'node:fs';
import path from 'node:path';

import { createClient } from '@supabase/supabase-js';

import type { Database } from '../src/types/supabase';

type CategorySlug = 'general' | 'business' | 'sports' | 'technology';

type TurkishSourceSeed = {
  slug: string;
  name: string;
  description: string;
  categorySlug: CategorySlug;
  siteUrl: string;
  feedUrl: string;
};

const TURKISH_RSS_SOURCES: TurkishSourceSeed[] = [
  {
    slug: 'trt-haber-son-dakika',
    name: 'TRT Haber Son Dakika',
    description: 'TRT Haber son dakika RSS akışı',
    categorySlug: 'general',
    siteUrl: 'https://www.trthaber.com',
    feedUrl: 'https://www.trthaber.com/sondakika_articles.rss',
  },
  {
    slug: 'hurriyet-ana-sayfa',
    name: 'Hürriyet Ana Sayfa',
    description: 'Hürriyet ana sayfa RSS akışı',
    categorySlug: 'general',
    siteUrl: 'https://www.hurriyet.com.tr',
    feedUrl: 'https://www.hurriyet.com.tr/rss/anasayfa',
  },
  {
    slug: 'cnnturk-gundem',
    name: 'CNN Türk Gündem',
    description: 'CNN Türk genel haber RSS akışı',
    categorySlug: 'general',
    siteUrl: 'https://www.cnnturk.com',
    feedUrl: 'https://www.cnnturk.com/feed/rss/all/news',
  },
  {
    slug: 'aa-guncel',
    name: 'Anadolu Ajansı Güncel',
    description: 'Anadolu Ajansı güncel haber RSS akışı',
    categorySlug: 'general',
    siteUrl: 'https://www.aa.com.tr',
    feedUrl: 'https://www.aa.com.tr/tr/rss/default?cat=guncel',
  },
  {
    slug: 'bloomberght-ekonomi',
    name: 'Bloomberg HT Ekonomi',
    description: 'Bloomberg HT ekonomi RSS akışı',
    categorySlug: 'business',
    siteUrl: 'https://www.bloomberght.com',
    feedUrl: 'https://www.bloomberght.com/rss',
  },
  {
    slug: 'haberturk-ekonomi',
    name: 'Habertürk Ekonomi',
    description: 'Habertürk ekonomi RSS akışı',
    categorySlug: 'business',
    siteUrl: 'https://www.haberturk.com',
    feedUrl: 'https://www.haberturk.com/rss/ekonomi.xml',
  },
  {
    slug: 'cnnturk-ekonomi',
    name: 'CNN Türk Ekonomi',
    description: 'CNN Türk ekonomi RSS akışı',
    categorySlug: 'business',
    siteUrl: 'https://www.cnnturk.com',
    feedUrl: 'https://www.cnnturk.com/feed/rss/ekonomi/news',
  },
  {
    slug: 'aa-ekonomi',
    name: 'Anadolu Ajansı Ekonomi',
    description: 'Anadolu Ajansı ekonomi RSS akışı',
    categorySlug: 'business',
    siteUrl: 'https://www.aa.com.tr',
    feedUrl: 'https://www.aa.com.tr/tr/rss/default?cat=ekonomi',
  },
  {
    slug: 'cnnturk-spor',
    name: 'CNN Türk Spor',
    description: 'CNN Türk spor RSS akışı',
    categorySlug: 'sports',
    siteUrl: 'https://www.cnnturk.com',
    feedUrl: 'https://www.cnnturk.com/feed/rss/spor/news',
  },
  {
    slug: 'hurriyet-spor',
    name: 'Hürriyet Spor',
    description: 'Hürriyet spor RSS akışı',
    categorySlug: 'sports',
    siteUrl: 'https://www.hurriyet.com.tr',
    feedUrl: 'https://www.hurriyet.com.tr/rss/spor',
  },
  {
    slug: 'aa-spor',
    name: 'Anadolu Ajansı Spor',
    description: 'Anadolu Ajansı spor RSS akışı',
    categorySlug: 'sports',
    siteUrl: 'https://www.aa.com.tr',
    feedUrl: 'https://www.aa.com.tr/tr/rss/default?cat=spor',
  },
  {
    slug: 'webtekno',
    name: 'Webtekno',
    description: 'Webtekno teknoloji RSS akışı',
    categorySlug: 'technology',
    siteUrl: 'https://www.webtekno.com',
    feedUrl: 'https://www.webtekno.com/rss.xml',
  },
  {
    slug: 'shiftdelete',
    name: 'ShiftDelete.Net',
    description: 'ShiftDelete.Net teknoloji RSS akışı',
    categorySlug: 'technology',
    siteUrl: 'https://shiftdelete.net',
    feedUrl: 'https://shiftdelete.net/feed',
  },
  {
    slug: 'ntv-teknoloji',
    name: 'NTV Teknoloji',
    description: 'NTV teknoloji RSS akışı',
    categorySlug: 'technology',
    siteUrl: 'https://www.ntv.com.tr',
    feedUrl: 'https://www.ntv.com.tr/teknoloji.rss',
  },
  {
    slug: 'aa-bilim-teknoloji',
    name: 'Anadolu Ajansı Bilim Teknoloji',
    description: 'Anadolu Ajansı bilim teknoloji RSS akışı',
    categorySlug: 'technology',
    siteUrl: 'https://www.aa.com.tr',
    feedUrl: 'https://www.aa.com.tr/tr/rss/default?cat=bilim-teknoloji',
  },
];

function readFromDotEnv(key: string): string {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    return '';
  }

  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const currentKey = trimmed.slice(0, separatorIndex).trim();
    if (currentKey !== key) {
      continue;
    }

    return trimmed.slice(separatorIndex + 1).trim();
  }

  return '';
}

function readEnv(key: string): string {
  return process.env[key]?.trim() || readFromDotEnv(key);
}

function normalizeFeedUrlForStorage(source: TurkishSourceSeed, supportsRssColumn: boolean) {
  if (supportsRssColumn) {
    return {
      website_url: source.siteUrl,
      rss_url: source.feedUrl,
    };
  }

  return {
    website_url: source.feedUrl,
  };
}

async function detectRssUrlColumnSupport(client: ReturnType<typeof createClient<Database>>) {
  const { error } = await client.from('sources').select('rss_url').limit(1);
  return !error;
}

async function main() {
  const supabaseUrl = readEnv('SUPABASE_URL') || readEnv('EXPO_PUBLIC_SUPABASE_URL');
  const supabaseServiceRoleKey = readEnv('SUPABASE_SERVICE_ROLE_KEY');
  const supabaseAnonKey = readEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      'Missing Supabase env values. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or EXPO_PUBLIC_* fallback).'
    );
    process.exit(1);
  }

  if (!supabaseServiceRoleKey) {
    console.warn(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Falling back to anon key. Upsert may fail if RLS is strict.'
    );
  }

  const client = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: categories, error: categoryError } = await client
    .from('categories')
    .select('id,slug')
    .eq('is_active', true);

  if (categoryError) {
    console.error('Failed to read categories:', categoryError.message);
    process.exit(1);
  }

  const categoryIdBySlug = new Map(
    (categories ?? []).map((category) => [category.slug, category.id])
  );
  const supportsRssColumn = await detectRssUrlColumnSupport(client);

  const rows = TURKISH_RSS_SOURCES.map((source) => {
    const categoryId = categoryIdBySlug.get(source.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing category for slug: ${source.categorySlug}`);
    }

    return {
      slug: source.slug,
      name: source.name,
      description: source.description,
      category_id: categoryId,
      is_active: true,
      ...normalizeFeedUrlForStorage(source, supportsRssColumn),
    };
  });

  const { data, error } = await client
    .from('sources')
    .upsert(rows, { onConflict: 'slug' })
    .select('id,slug,name,website_url,category_id');

  if (error) {
    console.error('Failed to upsert Turkish RSS sources:', error.message);
    process.exit(1);
  }

  const summary = {
    sourceCount: data?.length ?? 0,
    supportsRssColumn,
    slugs: (data ?? []).map((item) => item.slug),
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('seed-turkish-rss-sources failed:', message);
  process.exit(1);
});
