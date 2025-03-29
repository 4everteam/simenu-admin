// Format date to a more readable format with Jakarta timezone
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    // Use 'Asia/Jakarta' timezone for formatting
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta'
    }).format(date);
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateString;
  }
};

// Calculate time elapsed since a given date
export const getTimeElapsed = (dateString: string): string => {
  if (!dateString) return 'N/A';
  try {
    const pastDate = new Date(dateString);
    const now = new Date();
    
    // Calculate time difference in milliseconds
    const timeDiff = now.getTime() - pastDate.getTime();
    
    // Convert to seconds
    const seconds = Math.floor(timeDiff / 1000);
    
    // Less than a minute
    if (seconds < 60) {
      return `${seconds} detik yang lalu`;
    }
    
    // Less than an hour
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} menit yang lalu`;
    }
    
    // Less than a day
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} jam yang lalu`;
    }
    
    // Less than a month (approx 30 days)
    const days = Math.floor(hours / 24);
    if (days < 30) {
      return `${days} hari yang lalu`;
    }
    
    // Less than a year
    const months = Math.floor(days / 30);
    if (months < 12) {
      return `${months} bulan yang lalu`;
    }
    
    // More than a year
    const years = Math.floor(months / 12);
    return `${years} tahun yang lalu`;
    
  } catch (e) {
    console.error('Error calculating time elapsed:', e);
    return 'waktu tidak valid';
  }
};