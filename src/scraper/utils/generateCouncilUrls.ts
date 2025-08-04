const BASE_URL = process.env.SCRAPER_BASE_URL;

const formatCouncilName = (councilName: string): string => {
  return councilName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('-');
};

export default function generateCouncilUrls(
  councils: string[],
  maxPages: number,
  baseUrl: string, // <-- use the argument
): string[] {
  const urls: string[] = [];

  for (const council of councils) {
    const formattedCouncil = formatCouncilName(council);
    for (let i = 1; i <= maxPages; i++) {
      const url = `${baseUrl}/${formattedCouncil}/docs?page=${i}&status=current`;
      urls.push(url);
    }
  }

  return urls;
}

