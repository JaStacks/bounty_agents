import { Deque } from "@datastructures-js/deque";

/**
 * Escape text for Telegram MarkdownV2
 */
export function convertToTelegramMarkdown(text: string): string {
  const escapeChars = (str: string) =>
    str.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');

  return (
    text
      .split('\n')
      .map((line) => escapeChars(line))
      .join('\n')
      .replace(/^\\\#\\\#\\\# (.*$)/gm, '*$1*') // H3
      .replace(/^\\\#\\\# (.*$)/gm, '*$1*') // H2
      .replace(/^\\\# (.*$)/gm, '*$1*') // H1
      .replace(/\\\*\\\*(.*?)\\\*\\\*/g, '*$1*') // Bold
      .replace(/\\_(.*?)\\_/g, '_$1_') // Italic
      .replace(/^\\-\s+/gm, '• ') // Bullets
      .replace(/^\d+\\\.\s+/gm, '• ') // Numbered lists
      .replace(/\\\[(.*?)\\\]\\\((.*?)\\\)/g, '[$1]($2)') // Links
      .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
  );
}

/**
 * Extract tickers from text
 */
export function extractTickers(text: string): string[] {
  const matches = text.match(/\$[A-Za-z][A-Za-z0-9]*/g);
  return matches ? matches.map((match) => match.slice(1)) : [];
}

/**
 * Prune Deque by timestamp
 */
export function pruneDeque(deque: Deque<any>) {
  try {
    if (!(deque instanceof Deque)) {
      throw new Error("Invalid data type for deque. Expected a Deque.");
    }

    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24-hour cutoff
    let prunedCount = 0;

    while (!deque.isEmpty && deque.back().timestamp < cutoffTime) {
      deque.popBack();
      prunedCount++;
    }

    console.log(`Pruned ${prunedCount} old tweets from the Deque.`);
  } catch (error) {
    console.error(`Error in pruneDeque: ${error.message}`);
    throw error;
  }
}

/**
 * Generate a formatted report for Telegram
 */
export function generateReport(data: any[]): string {
  return data
    .map((token) => {
      const {
        tweetText,
        dexScreenerLink,
        projectTwitterLink,
        projectTelegramLink,
        projectWebsites,
        baseTokenName,
        baseTokenSymbol,
        chainId,
        dexId,
        liquidity,
        priceUsd,
        volume24h,
      } = token;

      const socialMediaLinks = [
        projectTwitterLink ? `• Twitter: [Link](${projectTwitterLink})` : null,
        projectTelegramLink ? `• Telegram: [Link](${projectTelegramLink})` : null,
      ]
        .filter(Boolean)
        .join('\n') || '_No social links available_';

      const websites = projectWebsites
        ? projectWebsites.map((url) => `• [${url}](${url})`).join('\n')
        : '_No websites available_';

      return `*${baseTokenName} (${baseTokenSymbol})* 📊

*Tweet*: "${tweetText}"

🔍 *Market Data*:
• Chain: ${chainId}
• DEX: ${dexId}
• Liquidity: ${liquidity}
• Price (USD): ${priceUsd}
• 24H Volume: ${volume24h}

💹 *Social Media Links*:
${socialMediaLinks}

🌐 *Websites*:
${websites}

🔗 *DexScreener Link*: [View on DexScreener](${dexScreenerLink})`;
    })
    .join('\n\n---\n\n');
}

/**
 * Format key-value pairs into a Markdown bullet list
 */
function formatKeyValuePairs(data: Record<string, string> | null): string {
  if (!data || Object.keys(data).length === 0) {
    return '_No data available_';
  }

  return Object.entries(data)
    .map(([key, value]) => `• *${key}:* ${value}`)
    .join('\n');
}