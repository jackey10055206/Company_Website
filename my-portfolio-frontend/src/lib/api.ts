// src/lib/api.ts
export const API_BASE = 'http://localhost:1337';
const SLUG = 'portfolios';

export async function getEnvironments() {
  const res = await fetch(
    `${API_BASE}/api/environments?populate=*`,
    { next: { revalidate: 10 } }
  );
  if (!res.ok) throw new Error('環境資料讀取失敗');
  const json = await res.json();
  return json.data; // array of { id, attributes: { title, photo: { data: { attributes: { url, formats... }}}}}
}

export async function getMachines() {
  const res = await fetch(
    `${API_BASE}/api/machines?populate=*`,
    { next: { revalidate: 10 } }
  );
  if (!res.ok) throw new Error('機器資料讀取失敗');
  const json = await res.json();
  return json.data;
}


export interface PortfolioItem {
  id: number;
  documentId: string;
  title: string;
  event_name: string;
  completion_date: string;
  event_location: string;
  description: any[];
  coverUrl?: string;
  galleryUrls?: string[];

}

export async function getPortfolios(): Promise<PortfolioItem[]> {
  
  const res = await fetch(`${API_BASE}/api/${SLUG}?populate=cover_image`, {
    next: { revalidate: 10 },
  });
  console.log("HERE: ",(`${API_BASE}/api/${SLUG}?populate=cover_image`))
  const json = await res.json();

  // 临时打印，看看 data 究竟是什么
  console.log('🌀 getPortfolios raw json:', JSON.stringify(json, null, 2));

  if (!res.ok) {
    console.error('Portfolio fetch failed:', res.status, json);
    throw new Error('Failed to fetch portfolios');
  }

  // 此处我们假设 json.data 应该是一个数组
  if (!Array.isArray(json.data)) {
    console.error('❌ Expected json.data to be an array but got:', json.data);
    return [];
  }

  
  // json.data 是一个数组，每项就是 entry 对象
  return json.data.map((entry: any) => {
    // 直接从 entry 拿字段
    let coverField = entry.cover_image;
    if (Array.isArray(coverField)) {
      coverField = coverField[0];
    }

    const urlPath =
      coverField?.formats?.small?.url
        ?? coverField?.url;
    const gallery = entry.gallery_images || [];

    return {
      id: entry.id,
      documentId: entry.documentId,
      title: entry.title,
      event_name: entry.event_name,
      completion_date: entry.completion_date,
      coverUrl: urlPath ||'',
      galleryUrls: entry.gallery_images?.map((img: any) => img.url) || []
      
    };
  });
}


export async function getPortfolio(documentId: string) {
  console.log("id:",documentId)
  const path = `/api/${SLUG}/${documentId}?populate=*`;
  console.log("path:",path)
  const url = `${API_BASE}${path}`;
  console.log('→ Fetching portfolio detail URL:', url);
  const res = await fetch(
    `${API_BASE}/api/${SLUG}/${documentId}?populate=*`,
    { next: { revalidate: 10 } }
  );
  if (!res.ok) {
    console.error('Single portfolio fetch failed:', res.status, await res.text());
    console.error('網址是:',url)
    throw new Error('Failed to fetch portfolio');
  }
  const json = await res.json();
  const entry = json.data;
  const cover = entry.cover_image;
  const gallery = entry.gallery_images || [];

  return {
    id: entry.id,
    documentId: entry.documentId,
    title: entry.title,
    event_name: entry.event_name,
    description: entry.description,  // rich-text
    completion_date: entry.completion_date,
    event_location: entry.event_location,
    coverUrl: entry.cover_image?.url ?? null,
    galleryUrls: entry.gallery_images?.map((img: any) => img.url) || [],
  };
}
