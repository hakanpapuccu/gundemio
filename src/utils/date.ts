export function formatTimeAgoTr(isoDate: string, nowDate: Date = new Date()) {
  const target = new Date(isoDate);
  if (Number.isNaN(target.getTime())) {
    return '';
  }

  const deltaSeconds = Math.max(0, Math.floor((nowDate.getTime() - target.getTime()) / 1000));

  if (deltaSeconds < 60) {
    return 'Az önce';
  }

  const minutes = Math.floor(deltaSeconds / 60);
  if (minutes < 60) {
    return `${minutes} dk önce`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} saat önce`;
  }

  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}
