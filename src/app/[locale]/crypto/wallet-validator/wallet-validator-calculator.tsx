"use client";

import { AlertTriangle, CheckCircle, Info, RotateCcw, Shield, Wallet, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WALLET_TYPES, type WalletType } from "@/lib/converters/crypto/wallet-validator";
import { useWalletValidatorStore } from "@/stores/wallet-validator-store";

export function WalletValidatorCalculator() {
  const t = useTranslations("calculator.crypto.wallet");
  const commonT = useTranslations("common");
  const { address, walletType, result, error, setAddress, setWalletType, reset } =
    useWalletValidatorStore();

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardContent className="pt-6 flex gap-3">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              {t("securityNotice")}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">{t("securityDescription")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {t("input")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="walletType">{t("walletType")}</Label>
            <Select value={walletType} onValueChange={(v) => setWalletType(v as WalletType)}>
              <SelectTrigger id="walletType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WALLET_TYPES.map((wallet) => (
                  <SelectItem key={wallet.type} value={wallet.type}>
                    {wallet.name} ({wallet.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t("addressLabel")}</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t("addressPlaceholder")}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">{t("publicAddressOnly")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Private Key Warning */}
      {result?.warningMessage && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive mb-1">{t("warnings.privateKeyTitle")}</p>
              <p className="text-sm text-muted-foreground">{t("warnings.privateKeyDescription")}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testnet Warning */}
      {result?.isValid && result.networkType === "testnet" && (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardContent className="pt-6 flex gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                {t("warnings.testnetTitle")}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {t("warnings.testnetDescription")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {result && !result.warningMessage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {t("result")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Validation Status */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <span className="font-medium">
                {result.isValid ? t("validAddress") : t("invalidAddress")}
              </span>
              {result.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
            </div>

            {result.isValid && (
              <>
                {/* Wallet Type */}
                <div className="grid grid-cols-2 gap-2 p-4 rounded-lg bg-muted">
                  <span className="text-sm text-muted-foreground">{t("walletTypeLabel")}</span>
                  <span className="text-sm font-mono font-semibold">{result.walletType}</span>
                </div>

                {/* Address Format */}
                {result.addressFormat && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 p-4 rounded-lg bg-muted">
                      <span className="text-sm text-muted-foreground">{t("addressFormat")}</span>
                      <span className="text-sm font-semibold">{result.addressFormat}</span>
                    </div>
                    {result.formatDescription && (
                      <p className="text-xs text-muted-foreground">{result.formatDescription}</p>
                    )}
                  </div>
                )}

                {/* Network Type */}
                <div className="grid grid-cols-2 gap-2 p-4 rounded-lg bg-muted">
                  <span className="text-sm text-muted-foreground">{t("networkType")}</span>
                  <span className="text-sm font-semibold capitalize">{result.networkType}</span>
                </div>

                {/* Checksum Valid (Ethereum only) */}
                {result.checksumValid !== null && (
                  <div className="grid grid-cols-2 gap-2 p-4 rounded-lg bg-muted">
                    <span className="text-sm text-muted-foreground">{t("checksumValid")}</span>
                    <span className="text-sm font-semibold">
                      {result.checksumValid ? t("yes") : t("no")}
                    </span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={reset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {commonT("reset")}
        </Button>
      </div>
    </div>
  );
}
