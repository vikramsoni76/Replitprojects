import { useEffect } from "react";

const BASE_TITLE = "EmbMarket";

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE_TITLE}` : `${BASE_TITLE} - Used Embroidery Machine Marketplace`;
  }, [title]);
}
