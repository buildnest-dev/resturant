// Unsplash stock photos by dish id. Replace with the restaurant's own photos later.
const ids: Record<string, string> = {
  m1: '1551538827-9c037cb4f32a',
  m2: '1461023058943-07fcbe16d735',
  m3: '1517487881594-2787fef5ebf7',
  m4: '1631452180519-c014fe946bc7',
  m5: '1589302168068-964664d93dc0',
  m6: '1528735602780-2552fd46c7af',
  m7: '1574071318508-1cdbab80d002',
  m10: '1606313564200-e75d5e30476c',
  m11: '1570197788417-0e82375c9371',
}

export const photoUrl = (dish: string) => (ids[dish] ? `https://images.unsplash.com/photo-${ids[dish]}?w=320&h=320&fit=crop&q=75` : '')
