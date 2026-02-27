/**
 * Point d'entrée du dossier biometric.
 *
 * Usage recommandé :
 *   import { BiometricScanner } from "@/components/biometric";
 *   import { useZkTeco } from "@/hooks/useZkTeco";
 *
 * Exemple minimal :
 *   const zk = useZkTeco();
 *   <BiometricScanner
 *     label="Membre"
 *     status={zk.scanStatus}
 *     error={zk.scanError}
 *     userId={zk.userId}
 *     scanning={zk.isScanning}
 *     onScan={zk.scanFingerprint}
 *   />
 */
export { default as BiometricScanner } from "./BiometricScanner";
export type { BiometricScannerProps, ScanStatus } from "./BiometricScanner";
