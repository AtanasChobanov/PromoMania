import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

import { useSettings } from "@/contexts/SettingsContext";
import Svg, { Path } from "react-native-svg";
import { createStyles } from "./productStyles";

export const chainLogos: Record<string, any> = {
  Lidl: require('@/assets/icons/Lidl-logo.png'),
  Kaufland: require('@/assets/icons/kaufland-logo.png'),
  Billa: require('@/assets/icons/billa-logo.jpg'),
  TMarket: require('@/assets/icons/tmarket-logo.png'),
};
export const productPriceHistory = [
  { value: 10, label: 'Янр' },
  { value: 15, label: 'Фев' },
  { value: 12, label: 'Мар' },
  { value: 15, label: 'Апр' },
  { value: 9, label: 'Май' },
  { value: 10, label: 'Юни' },
];
  
const formatTimeLeft = (validTo: string | null) => {
  if (!validTo) return null;

  const targetDate = new Date(validTo.replace(" ", "T")).getTime();
  const now = new Date().getTime();
  const difference = targetDate - now;

  if (difference <= 0) return "Изтекла оферта";

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}д ${hours}ч остават`;
  }
  return `${hours}ч ${minutes}мин остават`;
};

// --- Timer Component ---

export const DealTimer = ({ validTo, theme }: { validTo: string | null, theme: any }) => {
  const [timeLeft, setTimeLeft] = useState(formatTimeLeft(validTo));
  const { isSimpleMode } = useSettings();
  const styles = useMemo(
    () => createStyles({ isSimpleMode }),
    [ isSimpleMode]
  );
  useEffect(() => {
    if (!validTo) return;
    
    // Update immediately
    setTimeLeft(formatTimeLeft(validTo));

    const timer = setInterval(() => {
      const remaining = formatTimeLeft(validTo);
      setTimeLeft(remaining);
      // Stop timer if expired
      if (remaining === "Изтекла оферта") clearInterval(timer);
    }, 60000); // Update every minute is enough for "Days/Hours"

    return () => clearInterval(timer);
  }, [validTo]);

  if (!timeLeft || !validTo) return null;

  const isUrgent = !timeLeft.includes("д") && !timeLeft.includes("Изтекла"); // Less than 24h
  
  return (
    <View style={[styles.timerContainer, isUrgent ? { backgroundColor: 'rgba(255, 99, 71, 0.1)' } : null]}>
      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={isUrgent ? "#FF6347" : theme.colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <Path d="M12 6v6l4 2" />
      </Svg>
      <Text style={[
        styles.timerText, 
        { color: isUrgent ? "#FF6347" : theme.colors.textSecondary }
      ]}>
        {timeLeft}
      </Text>
    </View>
  );
};