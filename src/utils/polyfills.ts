// Polyfills pour compatibilité ES5/ES6

// Polyfill pour String.prototype.padStart
if (!String.prototype.padStart) {
  String.prototype.padStart = function(targetLength: number, padString: string = ' ') {
    if (this.length >= targetLength) {
      return String(this);
    }
    targetLength = targetLength - this.length;
    if (targetLength > padString.length) {
      padString += padString.repeat(targetLength / padString.length);
    }
    return padString.slice(0, targetLength) + String(this);
  };
}

// Polyfill pour Object.values
if (!Object.values) {
  Object.values = function(obj: any) {
    return Object.keys(obj).map(key => obj[key]);
  };
}

// Fonction utilitaire pour formater le temps
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const secsStr = secs.toString();
  return `${mins}:${secsStr.length < 2 ? '0' + secsStr : secsStr}`;
};

// Fonction utilitaire pour Object.values avec typage
export const getObjectValues = <T>(obj: Record<string, T>): T[] => {
  return Object.keys(obj).map(key => obj[key]);
};