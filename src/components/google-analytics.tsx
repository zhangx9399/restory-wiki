import Script from "next/script";

const ga4MeasurementId = /^G-[A-Z0-9]{4,}$/i;
const invalidMeasurementIdMessage = "NEXT_PUBLIC_GA_ID must be a GA4 measurement ID";

export function normalizeGoogleAnalyticsId(value?: string): string | undefined {
  const measurementId = value?.trim();

  if (!measurementId) {
    return undefined;
  }

  if (!ga4MeasurementId.test(measurementId)) {
    throw new Error(invalidMeasurementIdMessage);
  }

  return measurementId.toUpperCase();
}

export function GoogleAnalytics({ measurementId }: { measurementId?: string }) {
  const normalizedMeasurementId = normalizeGoogleAnalyticsId(measurementId);

  if (!normalizedMeasurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${normalizedMeasurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${normalizedMeasurementId}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}
