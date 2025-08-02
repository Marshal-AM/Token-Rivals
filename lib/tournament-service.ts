import { HermesClient } from "@pythnetwork/hermes-client";

// Price feed IDs for all tokens
// Note: The API returns IDs without 0x prefix, so we need both versions
export const PRICE_FEED_IDS = {
  // Strikers
  "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43": "BTC",
  "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43": "BTC",
  "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace": "ETH",
  "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace": "ETH",
  "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d": "SOL",
  "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d": "SOL",
  "0x78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501": "UNI",
  "78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501": "UNI",
  
  // Midfielders
  "0x385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf": "OP",
  "385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf": "OP",
  "0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5": "ARB",
  "3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5": "ARB",
  "0xb00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819": "ATOM",
  "b00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819": "ATOM",
  "0x03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5": "APT",
  "03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5": "APT",
  
  // Defenders
  "0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744": "SUI",
  "23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744": "SUI",
  "0x0bbf28e9a841a1cc788f6a361b17ca072d0ea3098a1e5df1c3922d06719579ff": "PYTH",
  "0bbf28e9a841a1cc788f6a361b17ca072d0ea3098a1e5df1c3922d06719579ff": "PYTH",
  "0x4279e31cc369bbcc2faf022b382b080e32a8e689ff20fbc530d2a603eb6cd98b": "HYPE",
  "4279e31cc369bbcc2faf022b382b080e32a8e689ff20fbc530d2a603eb6cd98b": "HYPE",
  "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a": "USDC",
  "eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a": "USDC",
  "0x846ae1bdb6300b817cee5fdee2a6da192775030db5615b94a465f53bd40850b5": "STETH",
  "846ae1bdb6300b817cee5fdee2a6da192775030db5615b94a465f53bd40850b5": "STETH"
};

export interface TokenPrice {
  symbol: string;
  price: number;
  timestamp: number;
}

export interface SquadValue {
  totalValue: number;
  tokenValues: { [tokenId: string]: number };
  timestamp: number;
}

export interface TournamentProgress {
  hostSquad: SquadValue;
  guestSquad: SquadValue;
  timestamp: number;
  timeRemaining: number;
}

export interface TournamentResult {
  winner: 'host' | 'guest' | 'tie';
  hostScore: number;
  guestScore: number;
  hostPercentageChange: number;
  guestPercentageChange: number;
  finalHostValue: number;
  finalGuestValue: number;
}

class TournamentService {
  private connection: HermesClient;
  private priceCache: Map<string, TokenPrice> = new Map();
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 1000; // 1 second cache

  constructor() {
    this.connection = new HermesClient("https://hermes.pyth.network", {});
  }

  // Fetch current prices for all tokens
  async fetchCurrentPrices(): Promise<TokenPrice[]> {
    const now = Date.now();
    
    // Return cached prices if they're still fresh
    if (now - this.lastFetchTime < this.CACHE_DURATION && this.priceCache.size > 0) {
      return Array.from(this.priceCache.values());
    }

    try {
      // Use IDs without 0x prefix for the API call
      const priceIds = [
        "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
        "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
        "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
        "78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501",
        "385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf",
        "3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5",
        "b00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819",
        "03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5",
        "23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744",
        "0bbf28e9a841a1cc788f6a361b17ca072d0ea3098a1e5df1c3922d06719579ff",
        "4279e31cc369bbcc2faf022b382b080e32a8e689ff20fbc530d2a603eb6cd98b",
        "eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
        "846ae1bdb6300b817cee5fdee2a6da192775030db5615b94a465f53bd40850b5"
      ];
      
      const result = await this.connection.getLatestPriceUpdates(priceIds);
      const updates = result.parsed;

      const prices: TokenPrice[] = [];
      
      if (updates) {
        updates.forEach((update) => {
          const symbol = PRICE_FEED_IDS[update.id as keyof typeof PRICE_FEED_IDS];
          if (symbol) {
            const rawPrice = update.price.price;
            const expo = update.price.expo;
            const actualPrice = Number(rawPrice) * Math.pow(10, expo);
            
            const tokenPrice: TokenPrice = {
              symbol,
              price: actualPrice,
              timestamp: now
            };
            
            prices.push(tokenPrice);
            this.priceCache.set(update.id, tokenPrice);
          }
        });
      }

      this.lastFetchTime = now;
      return prices;
    } catch (error) {
      console.error("Error fetching prices:", error);
      // Return cached prices if available, otherwise empty array
      return Array.from(this.priceCache.values());
    }
  }

  // Calculate squad value based on selected players
  calculateSquadValue(selectedPlayers: any[], prices: TokenPrice[]): SquadValue {
    const tokenValues: { [tokenId: string]: number } = {};
    let totalValue = 0;

    selectedPlayers.forEach((player) => {
      const tokenPrice = prices.find(p => p.symbol === player.token.symbol);
      if (tokenPrice) {
        const tokenValue = tokenPrice.price;
        tokenValues[player.token.priceFeedId] = tokenValue;
        totalValue += tokenValue;
      }
    });

    return {
      totalValue,
      tokenValues,
      timestamp: Date.now()
    };
  }

  // Calculate percentage change for a squad
  calculatePercentageChange(initialValue: number, finalValue: number): number {
    if (initialValue === 0) return 0;
    return ((finalValue - initialValue) / initialValue) * 100;
  }

  // Determine tournament winner
  // Both players bet the same way (LONG or SHORT) - winner is the one with better performance
  determineWinner(
    roomBet: 'LONG' | 'SHORT', // The bet type for the entire room
    hostPercentageChange: number,
    guestPercentageChange: number
  ): TournamentResult {
    let hostScore: number;
    let guestScore: number;

    if (roomBet === 'LONG') {
      // Both players are betting LONG - higher percentage increase wins
      hostScore = hostPercentageChange;
      guestScore = guestPercentageChange;
    } else {
      // Both players are betting SHORT - lower percentage decrease wins (less negative is better)
      hostScore = -hostPercentageChange; // Convert negative to positive for comparison
      guestScore = -guestPercentageChange;
    }

    let winner: 'host' | 'guest' | 'tie';
    if (hostScore > guestScore) {
      winner = 'host';
    } else if (guestScore > hostScore) {
      winner = 'guest';
    } else {
      winner = 'tie';
    }

    return {
      winner,
      hostScore,
      guestScore,
      hostPercentageChange,
      guestPercentageChange,
      finalHostValue: 0, // Will be set by caller
      finalGuestValue: 0 // Will be set by caller
    };
  }

  // Get price history for charting
  getPriceHistory(tokenId: string, duration: number = 60000): TokenPrice[] {
    // This would typically fetch from a database or cache
    // For now, we'll return a simple array
    return [];
  }
}

export const tournamentService = new TournamentService(); 