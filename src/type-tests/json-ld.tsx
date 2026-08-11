import { JsonLd } from "@/components/json-ld";

<JsonLd data={{ nested: ["value", 1, true, null] }} />;

// @ts-expect-error Functions are not JSON values.
<JsonLd data={{ callback: () => undefined }} />;

// @ts-expect-error Undefined is not a JSON value.
<JsonLd data={undefined} />;
