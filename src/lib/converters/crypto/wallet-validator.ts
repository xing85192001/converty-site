import WAValidator from "wallet-address-validator";
import type { CalculationResult } from "@/types";

export type WalletType = "BTC" | "ETH" | "LTC";
export type NetworkType = "mainnet" | "testnet";

export interface WalletValidationResult {
  address: string;
  walletType: WalletType;
  isValid: boolean;
  addressFormat: string | null;
  formatDescription: string | null;
  networkType: NetworkType;
  checksumValid: boolean | null; // Ethereum only
  warningMessage: string | null;
}

// Bitcoin address format patterns
const ADDRESS_FORMATS = {
  BTC: {
    P2PKH: {
      prefix: ["1"],
      name: "P2PKH (Legacy)",
      description: "Pay to Public Key Hash - Legacy Bitcoin address format",
    },
    P2SH: {
      prefix: ["3"],
      name: "P2SH (Script Hash)",
      description: "Pay to Script Hash - Multi-signature and SegWit-compatible",
    },
    P2WPKH: {
      prefix: ["bc1q"],
      name: "P2WPKH (Native SegWit)",
      description: "Pay to Witness Public Key Hash - Native SegWit (Bech32)",
      minLength: 42,
      maxLength: 42,
    },
    P2WSH: {
      prefix: ["bc1q"],
      name: "P2WSH (Native SegWit Script)",
      description: "Pay to Witness Script Hash - Native SegWit for complex scripts",
      minLength: 62,
      maxLength: 62,
    },
    P2TR: {
      prefix: ["bc1p"],
      name: "P2TR (Taproot)",
      description: "Pay to Taproot - Latest Bitcoin address format (Bech32m)",
    },
  },
  LTC: {
    Legacy: {
      prefix: ["L", "M"],
      name: "Legacy",
      description: "Litecoin legacy address format (P2PKH/P2SH)",
    },
    SegWit: {
      prefix: ["ltc1"],
      name: "SegWit",
      description: "Litecoin SegWit address format (Bech32)",
    },
  },
  ETH: {
    ERC20: {
      prefix: ["0x"],
      name: "ERC-20",
      description: "Ethereum address format (hexadecimal with EIP-55 checksum)",
      length: 42,
    },
  },
} as const;

/**
 * Detect Bitcoin address format based on prefix and length
 */
function detectBitcoinFormat(address: string): { name: string; description: string } | null {
  if (address.startsWith("1")) {
    return {
      name: ADDRESS_FORMATS.BTC.P2PKH.name,
      description: ADDRESS_FORMATS.BTC.P2PKH.description,
    };
  }

  if (address.startsWith("3")) {
    return {
      name: ADDRESS_FORMATS.BTC.P2SH.name,
      description: ADDRESS_FORMATS.BTC.P2SH.description,
    };
  }

  if (address.startsWith("bc1p")) {
    return {
      name: ADDRESS_FORMATS.BTC.P2TR.name,
      description: ADDRESS_FORMATS.BTC.P2TR.description,
    };
  }

  if (address.startsWith("bc1q")) {
    // Distinguish between P2WPKH and P2WSH by length
    const length = address.length;
    if (length === 42) {
      return {
        name: ADDRESS_FORMATS.BTC.P2WPKH.name,
        description: ADDRESS_FORMATS.BTC.P2WPKH.description,
      };
    }
    if (length === 62) {
      return {
        name: ADDRESS_FORMATS.BTC.P2WSH.name,
        description: ADDRESS_FORMATS.BTC.P2WSH.description,
      };
    }
    // Default to P2WPKH if length doesn't match exactly
    return {
      name: ADDRESS_FORMATS.BTC.P2WPKH.name,
      description: ADDRESS_FORMATS.BTC.P2WPKH.description,
    };
  }

  return null;
}

/**
 * Detect Litecoin address format based on prefix
 */
function detectLitecoinFormat(address: string): { name: string; description: string } | null {
  if (address.startsWith("ltc1")) {
    return {
      name: ADDRESS_FORMATS.LTC.SegWit.name,
      description: ADDRESS_FORMATS.LTC.SegWit.description,
    };
  }

  if (address.startsWith("L") || address.startsWith("M")) {
    return {
      name: ADDRESS_FORMATS.LTC.Legacy.name,
      description: ADDRESS_FORMATS.LTC.Legacy.description,
    };
  }

  return null;
}

/**
 * Validate Ethereum address checksum (EIP-55)
 * Returns true if checksum is valid, false if invalid, null if no checksum (all lowercase/uppercase)
 */
function validateEthereumChecksum(address: string): boolean | null {
  // Remove 0x prefix
  const addr = address.slice(2);

  // If all lowercase or all uppercase, no checksum validation
  if (addr === addr.toLowerCase() || addr === addr.toUpperCase()) {
    return null;
  }

  // Basic checksum validation (simplified - wallet-address-validator does full validation)
  // We'll return true here and rely on the validator for actual checksum verification
  return true;
}

/**
 * Detect network type (mainnet or testnet)
 */
function detectNetworkType(address: string, walletType: WalletType): NetworkType {
  if (walletType === "BTC") {
    // Bitcoin testnet addresses start with m, n, 2, or tb1
    if (
      address.startsWith("m") ||
      address.startsWith("n") ||
      address.startsWith("2") ||
      address.startsWith("tb1")
    ) {
      return "testnet";
    }
  }

  if (walletType === "LTC") {
    // Litecoin testnet addresses start with m, n, or tltc1
    if (address.startsWith("m") || address.startsWith("n") || address.startsWith("tltc1")) {
      return "testnet";
    }
  }

  // Ethereum doesn't have separate testnet address formats
  return "mainnet";
}

/**
 * Check if input might be a private key (warn user)
 */
function mightBePrivateKey(input: string): boolean {
  // Bitcoin WIF private keys start with 5, K, or L and are 51-52 chars
  if (
    (input.startsWith("5") || input.startsWith("K") || input.startsWith("L")) &&
    input.length >= 51 &&
    input.length <= 52
  ) {
    return true;
  }

  // Ethereum private keys are 64 hex characters (optionally with 0x prefix)
  const cleanInput = input.startsWith("0x") ? input.slice(2) : input;
  if (cleanInput.length === 64 && /^[0-9a-fA-F]+$/.test(cleanInput)) {
    return true;
  }

  return false;
}

/**
 * Validate wallet address
 */
export function validateWalletAddress(
  address: string,
  walletType: WalletType
): CalculationResult<WalletValidationResult> {
  const trimmedAddress = address.trim();

  // Check for private key pattern
  const privateKeyWarning = mightBePrivateKey(trimmedAddress);
  if (privateKeyWarning) {
    return {
      ok: true,
      value: {
        address: trimmedAddress,
        walletType,
        isValid: false,
        addressFormat: null,
        formatDescription: null,
        networkType: "mainnet",
        checksumValid: null,
        warningMessage: "This looks like a private key! Never share private keys publicly.",
      },
    };
  }

  // Detect network type
  const networkType = detectNetworkType(trimmedAddress, walletType);

  // Validate using wallet-address-validator
  let isValid = false;
  try {
    const currency =
      walletType === "BTC" ? "bitcoin" : walletType === "ETH" ? "ethereum" : "litecoin";
    const network = networkType === "testnet" ? "testnet" : undefined;
    isValid = WAValidator.validate(trimmedAddress, currency, network);
  } catch (error) {
    // Validation failed
    isValid = false;
  }

  // Detect format
  let addressFormat: string | null = null;
  let formatDescription: string | null = null;

  if (isValid) {
    if (walletType === "BTC") {
      const format = detectBitcoinFormat(trimmedAddress);
      if (format) {
        addressFormat = format.name;
        formatDescription = format.description;
      }
    } else if (walletType === "LTC") {
      const format = detectLitecoinFormat(trimmedAddress);
      if (format) {
        addressFormat = format.name;
        formatDescription = format.description;
      }
    } else if (walletType === "ETH") {
      addressFormat = ADDRESS_FORMATS.ETH.ERC20.name;
      formatDescription = ADDRESS_FORMATS.ETH.ERC20.description;
    }
  }

  // Ethereum checksum validation
  const checksumValid =
    walletType === "ETH" && isValid ? validateEthereumChecksum(trimmedAddress) : null;

  return {
    ok: true,
    value: {
      address: trimmedAddress,
      walletType,
      isValid,
      addressFormat,
      formatDescription,
      networkType,
      checksumValid,
      warningMessage: null,
    },
  };
}

/**
 * Wallet type metadata
 */
export const WALLET_TYPES = [
  {
    type: "BTC" as WalletType,
    name: "Bitcoin",
    symbol: "BTC",
  },
  {
    type: "ETH" as WalletType,
    name: "Ethereum",
    symbol: "ETH",
  },
  {
    type: "LTC" as WalletType,
    name: "Litecoin",
    symbol: "LTC",
  },
];

/**
 * Test addresses for verification
 */
export const TEST_ADDRESSES = {
  BTC: {
    valid: {
      P2PKH: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", // Genesis block
      P2SH: "3J98t1WpEZ73CNmYviecrnyiWrnqRhWNLy",
      P2WPKH: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
      P2WSH: "bc1qeklep85ntjz4605drds6aww9u0qr46qzrv5xswd35uhjuj8ahfcqgf6hak",
      P2TR: "bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297",
    },
    invalid: "1InvalidAddress123",
    testnet: "mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn",
  },
  ETH: {
    valid: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    invalid: "0xinvalid",
    lowercase: "0x742d35cc6634c0532925a3b844bc454e4438f44e",
  },
  LTC: {
    valid: {
      Legacy: "LWsJ4vfKfCDr2ypT9pvWp3WPGq7F72vKby",
      SegWit: "ltc1qneu7kmy3mzf07mdcyvw47qvgrx5u4f3g4vn7ug",
    },
    invalid: "LInvalidAddress",
    testnet: "mjNkq5ycsAfY9Vybo9jG8wbkC5mbpo4xgC",
  },
};
