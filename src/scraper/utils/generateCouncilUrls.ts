const BASE_URL = process.env.BASE_URL

const formatCouncilName = (councilName: string): string => {
  return councilName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('-');
};

export default function generateCouncilUrls(councils: string[], maxPages: number): string[] {
    const urls: string[] = [];

    for (const council of councils) {
        const formattedCouncil = formatCouncilName(council);
        for (let i = 1; i <= maxPages; i++) {
            const url = `${BASE_URL}/${formattedCouncil}/docs?page=${i}&status=current`;
            urls.push(url);
        }
    }
    return urls;
}
