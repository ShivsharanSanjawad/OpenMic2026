import { getPublicSettings } from "@/lib/settings";

export async function isLegacy10YearEnabled() {
	const { legacy_10_year_enabled } = await getPublicSettings();
	return legacy_10_year_enabled === "true";
}